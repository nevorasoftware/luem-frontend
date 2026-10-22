'use client';

import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Calendar, AlertTriangle, Loader2, X, CheckCircle2 } from 'lucide-react';

interface MaintenanceItem {
  id: string;
  vehicleId: string;
  title: string;
  description?: string;
  cost: number;
  startDate: string;
  endDate: string;
  status: string;
  vehicle: {
    name: string;
    brand: string;
    licensePlate: string;
  };
}

interface VehicleOption {
  id: string;
  name: string;
  brand: string;
  licensePlate: string;
}

export default function AdminMaintenancePage() {
  const [records, setRecords] = useState<MaintenanceItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [vehicleId, setVehicleId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('75');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, vRes] = await Promise.all([
        fetch('/api/maintenance'),
        fetch('/api/fleet/vehicles'),
      ]);
      if (mRes.ok) {
        const mData = await mRes.json();
        setRecords(Array.isArray(mData) ? mData : mData.records || []);
      }
      if (vRes.ok) {
        const vData = await vRes.json();
        const vList = Array.isArray(vData) ? vData : vData.vehicles || [];
        setVehicles(vList);
        if (vList.length > 0) setVehicleId(vList[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !title || !startDate || !endDate) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          title,
          description,
          cost: Math.round(parseFloat(cost) * 100),
          startDate: `${startDate}T08:00:00`,
          endDate: `${endDate}T18:00:00`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al programar mantenimiento');
      }

      alert('Mantenimiento programado y unidad bloqueada en calendario.');
      setShowModal(false);
      setTitle('');
      setDescription('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-luxem-night">Taller y Mantenimiento</h1>
          <p className="text-xs text-luxem-night/60 mt-1">
            Programación de servicios preventivos, cambio de aceite y bloqueos mecánicos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-luxem-primary hover:bg-luxem-accent text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Programar Mantenimiento
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-luxem-accent animate-spin mx-auto mb-2" />
            <p className="text-xs text-luxem-night/60">Cargando registros...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center text-sm font-bold text-luxem-night">
            No hay servicios de mantenimiento programados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-luxem-night/60 border-b border-gray-100 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Vehículo</th>
                  <th className="py-3.5 px-4">Servicio</th>
                  <th className="py-3.5 px-4">Fechas</th>
                  <th className="py-3.5 px-4">Costo Estimado</th>
                  <th className="py-3.5 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-luxem-night">
                      {r.vehicle.brand} {r.vehicle.name} ({r.vehicle.licensePlate})
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-luxem-night">{r.title}</div>
                      {r.description && <div className="text-[11px] text-gray-400">{r.description}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{new Date(r.startDate).toLocaleDateString('es-SV')}</div>
                      <div className="text-[11px] text-gray-400">al {new Date(r.endDate).toLocaleDateString('es-SV')}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-luxem-night">
                      ${(r.cost / 100).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-luxem-night">Programar Taller / Mantenimiento</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Vehículo *</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.name} ({v.licensePlate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Tipo de Servicio *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Cambio de Aceite y Filtros 10,000 km"
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Fecha Inicio *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Fecha Fin *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Costo Estimado (USD)</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Detalles / Taller</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nombre de taller y repuestos..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-luxem-primary hover:bg-luxem-accent text-white py-3 rounded-xl font-bold transition"
                >
                  {actionLoading ? 'Bloqueando calendario...' : 'Confirmar Programación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
