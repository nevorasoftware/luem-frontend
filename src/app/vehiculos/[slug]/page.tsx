'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  Users,
  Briefcase,
  Fuel,
  ShieldCheck,
  Check,
  AlertCircle,
  ChevronRight,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { formatUSD } from '../../../lib/utils';

interface VehicleDetail {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  vehicleType: string;
  transmission: string;
  fuelType: string;
  passengers: number;
  luggage: number;
  doors: number;
  airConditioning: boolean;
  dailyRate: string;
  weeklyRate: string | null;
  monthlyRate: string | null;
  depositAmount: string | null;
  description: string;
  rentalConditions: string;
  minDriverAge: number;
  category: { id: string; name: string };
  features: Array<{ id: string; name: string }>;
  photos: Array<{ id: string; url: string; alt: string }>;
}

export default function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [locations, setLocations] = useState<Array<{ id: string; name: string; fee: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Estados del selector de cotización
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');
  const [pickupLocationId, setPickupLocationId] = useState('');
  const [returnLocationId, setReturnLocationId] = useState('');

  // Cotización calculada
  const [quote, setQuote] = useState<any>(null);
  const [calculatingQuote, setCalculatingQuote] = useState(false);

  useEffect(() => {
    // Configurar fechas iniciales
    const pParam = searchParams.get('pickupAt');
    const rParam = searchParams.get('returnAt');

    const now = new Date();
    const d1 = pParam ? new Date(pParam) : new Date(now.getTime() + 24 * 3600 * 1000);
    const d2 = rParam ? new Date(rParam) : new Date(now.getTime() + 4 * 24 * 3600 * 1000);

    setPickupDate(d1.toISOString().split('T')[0]);
    setReturnDate(d2.toISOString().split('T')[0]);

    // Cargar vehículo y ubicaciones
    Promise.all([
      fetch(`/api/fleet/vehicles/slug/${resolvedParams.slug}`).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/fleet/locations').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([vehData, locData]) => {
        setVehicle(vehData);
        setLocations(locData);
        if (locData.length > 0) {
          setPickupLocationId(locData[0].id);
          setReturnLocationId(locData[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resolvedParams.slug]);

  // Recalcular cotización al cambiar fechas o ubicaciones
  useEffect(() => {
    if (!vehicle || !pickupDate || !returnDate) return;

    setCalculatingQuote(true);
    const p = `${pickupDate}T${pickupTime}:00Z`;
    const r = `${returnDate}T${returnTime}:00Z`;

    fetch('/api/fleet/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleId: vehicle.id,
        pickupAt: p,
        returnAt: r,
        pickupLocationId: pickupLocationId || undefined,
        returnLocationId: returnLocationId || undefined,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setQuote(data);
        setCalculatingQuote(false);
      })
      .catch(() => setCalculatingQuote(false));
  }, [vehicle, pickupDate, returnDate, pickupTime, returnTime, pickupLocationId, returnLocationId]);

  const handleProceedToBooking = () => {
    if (!vehicle) return;
    const p = `${pickupDate}T${pickupTime}:00Z`;
    const r = `${returnDate}T${returnTime}:00Z`;

    const query = new URLSearchParams({
      vehicleId: vehicle.id,
      pickupAt: p,
      returnAt: r,
      pickupLocationId,
      returnLocationId,
    });

    router.push(`/reservar?${query.toString()}`);
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Cargando detalles del vehículo...</div>;
  }

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Vehículo no encontrado</h2>
        <p className="text-slate-500 mt-2 mb-6">El vehículo solicitado no existe o fue descontinuado.</p>
        <Link href="/vehiculos" className="px-5 py-2.5 rounded-lg bg-[#1769AA] text-white font-bold text-sm">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-800">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/vehiculos" className="hover:text-slate-800">Vehículos</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-[#1769AA]">{vehicle.brand} {vehicle.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* COLUMNA IZQUIERDA: GALERÍA Y FICHA TÉCNICA */}
        <div className="lg:col-span-2 space-y-8">
          {/* Galería de imágenes */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-md">
            <div className="relative h-80 sm:h-96 bg-gradient-to-tr from-[#0B1220] to-[#1E293B] flex items-center justify-center p-6">
              {vehicle.photos && vehicle.photos[selectedPhotoIndex] ? (
                <img
                  src={vehicle.photos[selectedPhotoIndex].url}
                  alt={vehicle.photos[selectedPhotoIndex].alt}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Car className="w-28 h-28 text-[#299BEB]/50" />
              )}
              <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full bg-[#0B1220]/90 text-[#299BEB] border border-[#299BEB]/30 backdrop-blur-sm">
                {vehicle.category.name}
              </span>
            </div>

            {/* Miniaturas de galería si hay más de 1 */}
            {vehicle.photos && vehicle.photos.length > 1 && (
              <div className="p-4 bg-slate-50 flex gap-3 overflow-x-auto border-t border-slate-100">
                {vehicle.photos.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedPhotoIndex === idx ? 'border-[#1769AA] scale-105' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={p.url} alt={p.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Título y Especificaciones */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h1 className="text-3xl font-black text-[#0B1220] tracking-tight">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </h1>
              <p className="text-sm text-slate-500 mt-1">{vehicle.description || 'Vehículo confortable y confiable.'}</p>
            </div>

            {/* Rejilla de especificaciones técnicas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
              <div className="p-3 bg-[#F4F6F8] rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Transmisión</span>
                <span className="text-sm font-bold text-slate-800 capitalize">{vehicle.transmission.toLowerCase()}</span>
              </div>
              <div className="p-3 bg-[#F4F6F8] rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Combustible</span>
                <span className="text-sm font-bold text-slate-800 capitalize">{vehicle.fuelType.toLowerCase()}</span>
              </div>
              <div className="p-3 bg-[#F4F6F8] rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pasajeros</span>
                <span className="text-sm font-bold text-slate-800">{vehicle.passengers} personas</span>
              </div>
              <div className="p-3 bg-[#F4F6F8] rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Maletas</span>
                <span className="text-sm font-bold text-slate-800">{vehicle.luggage} equipajes</span>
              </div>
            </div>

            {/* Equipamiento y características */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Equipamiento Incluido
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {vehicle.features.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <Check className="w-4 h-4 text-[#1769AA]" />
                      <span>{f.name}</span>
                    </div>
                  ))}
                  {vehicle.airConditioning && (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <Check className="w-4 h-4 text-[#1769AA]" />
                      <span>Aire Acondicionado Climatizado</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Condiciones de alquiler */}
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              <h3 className="font-bold uppercase tracking-wider text-slate-800">
                Condiciones Generales del Alquiler
              </h3>
              <p>• Edad mínima requerida del conductor: {vehicle.minDriverAge || 21} años.</p>
              <p>• Licencia de conducir vigente con al menos 1 año de antigüedad.</p>
              <p>• Depósito de garantía reembolsable: {formatUSD(vehicle.depositAmount || 250)}.</p>
              <p>• Política de combustible: Mismo nivel recibido (lleno a lleno).</p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: COTIZADOR INTERACTIVO Y BOTÓN DE RESERVA */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xl space-y-6">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarifa Base</span>
                <span className="text-3xl font-black text-[#1769AA]">{formatUSD(vehicle.dailyRate)}</span>
                <span className="text-xs text-slate-500">/día</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Disponible
              </span>
            </div>

            {/* Fechas de recogida y devolución */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Recogida
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Devolución
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Lugar de Entrega
                </label>
                <select
                  value={pickupLocationId}
                  onChange={(e) => setPickupLocationId(e.target.value)}
                  className="w-full bg-[#F4F6F8] border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {Number(loc.fee) > 0 ? `(+${formatUSD(loc.fee)})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desglose de cotización en tiempo real */}
            {quote && (
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Días de alquiler:</span>
                  <span className="font-bold text-slate-800">{quote.billableDays} días</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal alquiler:</span>
                  <span className="font-bold text-slate-800">{formatUSD(quote.summary.baseAmount)}</span>
                </div>
                {Number(quote.summary.feesTotal) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Cargos de ubicación:</span>
                    <span className="font-bold text-slate-800">+{formatUSD(quote.summary.feesTotal)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-[#0B1220]">
                  <span>Total Estimado:</span>
                  <span className="text-[#1769AA] text-base">{formatUSD(quote.summary.total)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Depósito de garantía:</span>
                  <span>{formatUSD(quote.summary.depositRequired)}</span>
                </div>
              </div>
            )}

            {/* Advertencia obligatoria de disponibilidad */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-800 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                La disponibilidad definitiva depende de la validación documental y aprobación de la solicitud.
              </span>
            </div>

            {/* Botón de acción */}
            <button
              onClick={handleProceedToBooking}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#1769AA] to-[#299BEB] hover:from-[#13568c] hover:to-[#2284c9] shadow-lg shadow-[#1769AA]/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <span>Continuar con la Solicitud</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
