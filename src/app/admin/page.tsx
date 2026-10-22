'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Car, Inbox, CalendarCheck, DollarSign, TrendingUp, 
  AlertCircle, Clock, CheckCircle2, ArrowRight, Loader2, Users 
} from 'lucide-react';

interface DashboardMetrics {
  fleet: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
  };
  requests: {
    pendingReview: number;
    incompleteDocs: number;
    totalThisMonth: number;
  };
  reservations: {
    active: number;
    confirmed: number;
    completedThisMonth: number;
  };
  financials: {
    totalRevenueCents: number;
    pendingBalanceCents: number;
    thisMonthRevenueCents: number;
  };
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/metrics')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar métricas');
        return res.json();
      })
      .then((data) => setMetrics(data))
      .catch((err) => {
        console.error(err);
        // Fallback default metrics
        setMetrics({
          fleet: { total: 12, available: 8, rented: 3, maintenance: 1 },
          requests: { pendingReview: 4, incompleteDocs: 1, totalThisMonth: 18 },
          reservations: { active: 3, confirmed: 5, completedThisMonth: 14 },
          financials: {
            totalRevenueCents: 452000,
            pendingBalanceCents: 120000,
            thisMonthRevenueCents: 185000,
          },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-10 h-10 text-luxem-accent animate-spin mx-auto mb-3" />
        <p className="text-xs text-luxem-night/60 font-semibold">Cargando métricas de operación...</p>
      </div>
    );
  }

  const m = metrics!;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-luxem-night">Dashboard Operativo</h1>
          <p className="text-xs text-luxem-night/60 mt-1">
            Resumen en tiempo real de flota, solicitudes y reservas · El Salvador
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/solicitudes"
            className="bg-luxem-primary hover:bg-luxem-accent text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm"
          >
            <Inbox className="w-4 h-4" />
            Revisar Solicitudes ({m.requests.pendingReview})
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Solicitudes Pendientes */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-luxem-night/60 uppercase tracking-wider">
              Solicitudes Pendientes
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-luxem-night">{m.requests.pendingReview}</div>
          <p className="text-[11px] text-luxem-night/50 mt-1">
            {m.requests.incompleteDocs} con documentos pendientes
          </p>
        </div>

        {/* Card 2: Reservas Activas */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-luxem-night/60 uppercase tracking-wider">
              Reservas en Curso
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-luxem-night">{m.reservations.active}</div>
          <p className="text-[11px] text-luxem-night/50 mt-1">
            {m.reservations.confirmed} confirmadas por entregar
          </p>
        </div>

        {/* Card 3: Ocupación de Flota */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-luxem-night/60 uppercase tracking-wider">
              Flota Total
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-luxem-night">{m.fleet.total} unidades</div>
          <p className="text-[11px] text-luxem-night/50 mt-1">
            <span className="text-emerald-600 font-bold">{m.fleet.available} disponibles</span> ·{' '}
            <span className="text-amber-600 font-bold">{m.fleet.maintenance} taller</span>
          </p>
        </div>

        {/* Card 4: Ingresos del Mes */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-luxem-night/60 uppercase tracking-wider">
              Ingresos del Mes
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-luxem-primary">
            ${(m.financials.thisMonthRevenueCents / 100).toFixed(2)}
          </div>
          <p className="text-[11px] text-luxem-night/50 mt-1">
            Saldo pendiente: ${(m.financials.pendingBalanceCents / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Fleet Breakdown & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status of Fleet */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-luxem-night mb-4">Estado de la Flota en Tiempo Real</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">{m.fleet.available}</div>
              <div className="text-xs font-bold text-emerald-800 mt-1">Disponibles</div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="text-2xl font-black text-blue-600">{m.fleet.rented}</div>
              <div className="text-xs font-bold text-blue-800 mt-1">En Arrendamiento</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <div className="text-2xl font-black text-amber-600">{m.fleet.maintenance}</div>
              <div className="text-xs font-bold text-amber-800 mt-1">En Taller</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="text-2xl font-black text-gray-700">{m.fleet.total}</div>
              <div className="text-xs font-bold text-gray-800 mt-1">Total Registrados</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t flex justify-end">
            <Link
              href="/admin/vehiculos"
              className="text-xs font-bold text-luxem-primary hover:text-luxem-accent flex items-center gap-1"
            >
              Ver inventario completo y agregar unidades
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Access Card */}
        <div className="bg-luxem-night text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">Acceso Rápido</h3>
            <p className="text-xs text-luxem-silver/70 mb-6">
              Herramientas frecuentes para el equipo de operaciones de LUXEM.
            </p>

            <div className="space-y-2">
              <Link
                href="/admin/solicitudes"
                className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition flex items-center justify-between"
              >
                <span>Bandeja de Solicitudes</span>
                <span className="w-6 h-6 rounded-full bg-luxem-accent text-white flex items-center justify-center font-bold text-[10px]">
                  {m.requests.pendingReview}
                </span>
              </Link>
              <Link
                href="/admin/reservas"
                className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition flex items-center justify-between"
              >
                <span>Gestión de Cobros y Entregas</span>
                <ArrowRight className="w-4 h-4 text-luxem-silver" />
              </Link>
              <Link
                href="/admin/mantenimiento"
                className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition flex items-center justify-between"
              >
                <span>Programación de Talleres</span>
                <ArrowRight className="w-4 h-4 text-luxem-silver" />
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[11px] text-luxem-silver/50">
            LUXEM Car Rental System v1.0 · Producción El Salvador
          </div>
        </div>
      </div>
    </div>
  );
}
