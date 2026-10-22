'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Car,
  Filter,
  Users,
  Briefcase,
  Fuel,
  Sparkles,
  CheckCircle2,
  Calendar,
  Search,
  RotateCcw,
} from 'lucide-react';
import { formatUSD } from '../../lib/utils';

interface VehicleItem {
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
  airConditioning: boolean;
  dailyRate: string;
  depositAmount: string | null;
  description: string;
  category: { id: string; name: string };
  features: Array<{ id: string; name: string }>;
  photos: Array<{ id: string; url: string; alt: string }>;
}

function CatalogContent() {
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('');
  const [selectedPassengers, setSelectedPassengers] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pickupAt, setPickupAt] = useState<string>(searchParams.get('pickupAt') || '');
  const [returnAt, setReturnAt] = useState<string>(searchParams.get('returnAt') || '');

  // Cargar categorías
  useEffect(() => {
    fetch('/api/fleet/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data))
      .catch(() => null);
  }, []);

  // Cargar vehículos filtrados
  const fetchVehicles = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set('categoryId', selectedCategory);
    if (selectedTransmission) params.set('transmission', selectedTransmission);
    if (selectedPassengers) params.set('passengers', selectedPassengers);
    if (searchQuery) params.set('search', searchQuery);
    if (pickupAt) params.set('pickupAt', pickupAt);
    if (returnAt) params.set('returnAt', returnAt);

    fetch(`/api/fleet/vehicles?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setVehicles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setVehicles([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVehicles();
  }, [selectedCategory, selectedTransmission, selectedPassengers, pickupAt, returnAt]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedTransmission('');
    setSelectedPassengers('');
    setSearchQuery('');
    setPickupAt('');
    setReturnAt('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Encabezado */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">
          Flota Disponible
        </span>
        <h1 className="text-3xl font-black text-[#0B1220] tracking-tight mt-1">
          Catálogo de Vehículos
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Todos nuestros vehículos cuentan con mantenimiento al día, seguro y asistencia vial.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTROS LATERALES */}
        <aside className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm h-fit space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-[#0B1220] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#1769AA]" />
              <span>Filtros</span>
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs text-[#1769AA] hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          </div>

          {/* Búsqueda por texto */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Buscar Modelo o Marca
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Corolla, Tucson, Hilux..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVehicles()}
                className="w-full bg-[#F4F6F8] border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#F4F6F8] border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Transmisión */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Transmisión
            </label>
            <select
              value={selectedTransmission}
              onChange={(e) => setSelectedTransmission(e.target.value)}
              className="w-full bg-[#F4F6F8] border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="">Cualquier transmisión</option>
              <option value="AUTOMATICA">Automática</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>

          {/* Pasajeros */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Capacidad de Pasajeros
            </label>
            <select
              value={selectedPassengers}
              onChange={(e) => setSelectedPassengers(e.target.value)}
              className="w-full bg-[#F4F6F8] border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="">Cualquier capacidad</option>
              <option value="5">5 o más pasajeros</option>
              <option value="7">7 o más pasajeros</option>
            </select>
          </div>

          <button
            onClick={fetchVehicles}
            className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-[#1769AA] hover:bg-[#13568c] transition-colors"
          >
            Aplicar Filtros
          </button>
        </aside>

        {/* LISTADO DE VEHÍCULOS */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Imagen del vehículo */}
                    <div className="relative h-48 bg-gradient-to-tr from-[#0B1220] to-[#1E293B] flex items-center justify-center overflow-hidden">
                      {v.photos && v.photos[0] ? (
                        <img
                          src={v.photos[0].url}
                          alt={v.photos[0].alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Car className="w-16 h-16 text-[#299BEB]/50" />
                      )}
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0B1220]/90 text-[#299BEB] border border-[#299BEB]/30 backdrop-blur-sm">
                        {v.category.name}
                      </span>
                    </div>

                    {/* Información */}
                    <div className="p-5">
                      <h3 className="font-extrabold text-lg text-[#0B1220] tracking-tight">
                        {v.brand} {v.model}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mb-3">
                        Modelo {v.year} • {v.vehicleType}
                      </p>

                      {/* Especificaciones clave */}
                      <div className="grid grid-cols-3 gap-1 py-2.5 px-3 bg-[#F4F6F8] rounded-xl text-[11px] font-semibold text-slate-700 mb-3">
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

                      {/* Características */}
                      {v.features && v.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {v.features.slice(0, 2).map((f) => (
                            <span
                              key={f.id}
                              className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[#1769AA] font-semibold"
                            >
                              {f.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Precios y Botón */}
                  <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Tarifa Diaria
                      </span>
                      <span className="text-xl font-black text-[#1769AA]">
                        {formatUSD(v.dailyRate)}
                      </span>
                      <span className="text-xs text-slate-500">/día</span>
                    </div>

                    <Link
                      href={`/vehiculos/${v.slug}${pickupAt && returnAt ? `?pickupAt=${encodeURIComponent(pickupAt)}&returnAt=${encodeURIComponent(returnAt)}` : ''}`}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1769AA] to-[#299BEB] text-white text-xs font-bold hover:from-[#13568c] hover:to-[#2284c9] shadow-md transition-all hover:scale-[1.02]"
                    >
                      Ver y Cotizar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-slate-700">
                No se encontraron vehículos disponibles
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Intente ajustar los filtros de fechas, categoría o transmisión para encontrar opciones disponibles.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-lg bg-[#1769AA] text-white text-xs font-bold hover:bg-[#13568c]"
              >
                Restablecer Filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Cargando catálogo...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
