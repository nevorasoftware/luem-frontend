'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Plane,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Phone,
  Fuel,
  Users,
  Briefcase,
  ChevronDown,
} from 'lucide-react';
import { formatUSD } from '../lib/utils';

interface VehicleSummary {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  dailyRate: string;
  transmission: string;
  fuelType: string;
  passengers: number;
  luggage: number;
  category: { name: string };
  photos: Array<{ url: string; alt: string }>;
}

export default function HomePage() {
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Estados del buscador
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');
  const [location, setLocation] = useState('aeropuerto');

  useEffect(() => {
    // Configurar fechas mínimas por defecto (hoy + 2 días)
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(d1.getDate() + 1);
    const d2 = new Date(today);
    d2.setDate(d2.getDate() + 4);

    setPickupDate(d1.toISOString().split('T')[0]);
    setReturnDate(d2.toISOString().split('T')[0]);

    // Cargar vehículos destacados desde el backend
    fetch('/api/fleet/vehicles')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setVehicles(Array.isArray(data) ? data.slice(0, 4) : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = `${pickupDate}T${pickupTime}:00Z`;
    const r = `${returnDate}T${returnTime}:00Z`;
    window.location.href = `/vehiculos?pickupAt=${encodeURIComponent(p)}&returnAt=${encodeURIComponent(r)}&loc=${location}`;
  };

  const faqs = [
    {
      q: '¿Cuáles son los requisitos obligatorios para alquilar un vehículo en LUEM?',
      a: 'Debe ser mayor de 21 años, contar con DUI o Pasaporte vigente, Licencia de conducir válida y un comprobante de domicilio reciente (recibo de luz o agua). Los documentos se cargan digitalmente en nuestra plataforma para su validación previa.',
    },
    {
      q: '¿Cómo funciona el proceso de reserva y pago?',
      a: '1) Selecciona el vehículo y las fechas deseadas. 2) Envía el formulario con tus datos y fotografías de tus documentos. 3) Nuestro equipo revisa y aprueba tu solicitud en pocas horas. 4) Recibirás un correo oficial con la cotización aprobada y las instrucciones de pago por transferencia o depósito.',
    },
    {
      q: '¿Tienen servicio de entrega en el Aeropuerto Internacional de El Salvador (SAL)?',
      a: 'Sí, contamos con entrega y recepción programada directamente en el Aeropuerto Internacional San Óscar Romero (SAL) y en nuestra sucursal de San Salvador.',
    },
    {
      q: '¿Existe depósito de garantía?',
      a: 'Sí, todo alquiler requiere un depósito o garantía reembolsable según la categoría del vehículo ($250 a $500 USD), el cual se libera al devolver el vehículo en las mismas condiciones.',
    },
    {
      q: '¿Cómo puedo dar seguimiento a mi solicitud de reserva?',
      a: 'Al enviar tu formulario, recibirás un enlace seguro exclusivo con un token de acceso criptográfico. Con este enlace podrás verificar en tiempo real si tu documentación fue aceptada, aprobada o si se requiere información adicional.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#0B1220] text-white overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#299BEB] blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#1769AA] blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1769AA]/30 border border-[#299BEB]/30 text-xs font-bold text-[#299BEB] tracking-wide uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Experiencia de Alquiler Premium en El Salvador</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Tu Viaje por El Salvador Comienza con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#299BEB] via-[#C7D0DA] to-white">
                LUEM
              </span>
            </h1>

            <p className="text-lg text-[#C7D0DA] leading-relaxed">
              Sedanes modernos, camionetas SUV y Pick-ups 4x4 listos para recorrer playas,
              montañas y ciudades. Reserva en línea con validación digital segura y sin sorpresas.
            </p>
          </div>

          {/* 2. BUSCADOR INTERACTIVO EN TIEMPO REAL */}
          <div className="mt-12 max-w-4xl mx-auto bg-white/95 text-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md border border-slate-200">
            <h2 className="text-base font-bold uppercase tracking-wider text-[#1769AA] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#299BEB]" />
              <span>Cotizar Disponibilidad de Vehículos</span>
            </h2>

            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Lugar */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1769AA]" />
                  <span>Punto de Entrega</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                >
                  <option value="aeropuerto">Aeropuerto Internacional (SAL)</option>
                  <option value="sansalvador">Sucursal Central — San Salvador</option>
                  <option value="santaana">Sucursal Santa Ana</option>
                  <option value="sanmiguel">Sucursal San Miguel</option>
                </select>
              </div>

              {/* Recogida */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1769AA]" />
                  <span>Fecha de Recogida</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                </div>
              </div>

              {/* Devolución */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#1769AA]" />
                  <span>Fecha de Devolución</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                </div>
              </div>

              {/* Botón Buscar */}
              <div className="md:col-span-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#1769AA] to-[#299BEB] hover:from-[#13568c] hover:to-[#2284c9] shadow-lg shadow-[#1769AA]/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <Car className="w-5 h-5" />
                  <span>Buscar Vehículos Disponibles</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. FLOTA DESTACADA */}
      <section className="py-20 bg-[#F4F6F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#1769AA]">
                Nuestra Flota
              </span>
              <h2 className="text-3xl font-extrabold text-[#0B1220] tracking-tight mt-1">
                Vehículos Destacados
              </h2>
            </div>
            <Link
              href="/vehiculos"
              className="mt-4 md:mt-0 text-sm font-bold text-[#1769AA] hover:text-[#299BEB] flex items-center gap-1 group"
            >
              <span>Ver catálogo completo</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 bg-white rounded-2xl animate-pulse p-4" />
              ))
            ) : vehicles.length > 0 ? (
              vehicles.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Foto o Mock automotriz elegante */}
                  <div className="relative h-48 bg-gradient-to-tr from-[#0B1220] to-[#1E293B] flex items-center justify-center p-4 overflow-hidden">
                    {v.photos && v.photos[0] ? (
                      <img
                        src={v.photos[0].url}
                        alt={v.photos[0].alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Car className="w-20 h-20 text-[#299BEB]/60" />
                    )}
                    <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0B1220]/80 text-[#299BEB] border border-[#299BEB]/30 backdrop-blur-sm">
                      {v.category.name}
                    </span>
                  </div>

                  {/* Detalles */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-lg text-[#0B1220] tracking-tight">
                        {v.brand} {v.model}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mb-4">
                        Año {v.year}
                      </p>

                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-[11px] font-medium text-slate-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#1769AA]" />
                          <span>{v.passengers} pas.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-[#1769AA]" />
                          <span>{v.luggage} mal.</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <Fuel className="w-3.5 h-3.5 text-[#1769AA]" />
                          <span className="capitalize truncate">{v.transmission.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Desde
                        </span>
                        <span className="text-xl font-black text-[#1769AA]">
                          {formatUSD(v.dailyRate)}
                        </span>
                        <span className="text-xs text-slate-500">/día</span>
                      </div>

                      <Link
                        href={`/vehiculos/${v.slug}`}
                        className="px-3.5 py-2 rounded-lg bg-[#0B1220] text-white text-xs font-bold hover:bg-[#1769AA] transition-colors"
                      >
                        Ver Detalle
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-slate-500">
                Catálogo disponible para consulta. Inicie su búsqueda personalizada arriba.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. BENEFICIOS */}
      <section id="beneficios" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1769AA]">
              ¿Por Qué Elegir LUEM?
            </span>
            <h2 className="text-3xl font-extrabold text-[#0B1220] tracking-tight mt-1">
              Tranquilidad y Calidad en Cada Kilómetro
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#F4F6F8] border border-slate-200/80 hover:border-[#1769AA]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1769AA]/15 text-[#1769AA] flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#0B1220] mb-2">
                Documentación Verificada
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Revisión ágil de DUI y licencia antes de tu viaje. Te garantizamos
                la disponibilidad de tu vehículo sin filas ni trámites de última hora.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F4F6F8] border border-slate-200/80 hover:border-[#1769AA]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1769AA]/15 text-[#1769AA] flex items-center justify-center mb-5">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#0B1220] mb-2">
                Entrega en Aeropuerto SAL
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Coordinamos la entrega de tu auto a la hora de aterrizaje de tu vuelo.
                Bajas del avión y sales conduciendo.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F4F6F8] border border-slate-200/80 hover:border-[#1769AA]/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1769AA]/15 text-[#1769AA] flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-[#0B1220] mb-2">
                Tarifas Claras y Sin Sorpresas
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nuestras cotizaciones incluyen todos los días facturables, extras y
                el importe de garantía aplicable. Sin cobros imprevistos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CÓMO FUNCIONA EL PROCESO EN 4 PASOS */}
      <section id="proceso" className="py-20 bg-[#0B1220] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#299BEB]">
              Proceso Transparente
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Alquila en 4 Pasos Sencillos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
              <span className="text-4xl font-black text-[#299BEB]/30 block mb-3">01</span>
              <h3 className="text-base font-bold text-white mb-2">Selecciona Vehículo</h3>
              <p className="text-xs text-[#C7D0DA] leading-relaxed">
                Elige el auto que mejor se adapte a tu viaje, fechas de recogida y lugar de entrega.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
              <span className="text-4xl font-black text-[#299BEB]/30 block mb-3">02</span>
              <h3 className="text-base font-bold text-white mb-2">Sube tus Documentos</h3>
              <p className="text-xs text-[#C7D0DA] leading-relaxed">
                Adjunta foto legible de tu DUI, licencia y recibo de luz/agua en nuestro formulario cifrado.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
              <span className="text-4xl font-black text-[#299BEB]/30 block mb-3">03</span>
              <h3 className="text-base font-bold text-white mb-2">Validación y Aprobación</h3>
              <p className="text-xs text-[#C7D0DA] leading-relaxed">
                Nuestro equipo valida tu documentación y te envía por correo la cotización aprobada y las instrucciones.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
              <span className="text-4xl font-black text-[#299BEB]/30 block mb-3">04</span>
              <h3 className="text-base font-bold text-white mb-2">Pago y Retiro</h3>
              <p className="text-xs text-[#C7D0DA] leading-relaxed">
                Realizas el pago seguro y recibes tu vehículo inspeccionado listo para disfrutar El Salvador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section id="preguntas-frecuentes" className="py-20 bg-[#F4F6F8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1769AA]">
              Dudas Comunes
            </span>
            <h2 className="text-3xl font-extrabold text-[#0B1220] tracking-tight mt-1">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left font-bold text-[#0B1220] flex items-center justify-between hover:bg-slate-50 transition-colors text-sm"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#1769AA] shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. LLAMADO A LA ACCIÓN (CTA) */}
      <section className="py-16 bg-gradient-to-r from-[#0B1220] via-[#1769AA] to-[#0B1220] text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">¿Listo para conducir en El Salvador?</h2>
          <p className="text-sm text-[#C7D0DA] mb-8 max-w-xl mx-auto">
            Consulta nuestra flota en tiempo real o contáctanos por WhatsApp para asistencia personalizada en tu reserva.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/vehiculos"
              className="px-8 py-3.5 rounded-xl font-bold text-[#0B1220] bg-white hover:bg-slate-100 shadow-xl transition-all"
            >
              Explorar Catálogo
            </Link>
            <a
              href="https://wa.me/50377778888?text=Hola,%20deseo%20asistencia%20para%20reservar%20un%20veh%C3%ADculo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl font-bold text-white bg-[#299BEB] hover:bg-[#2083cb] shadow-xl transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Chatear por WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
