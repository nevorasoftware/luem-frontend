'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wrench, Plus, Calendar, AlertTriangle, Loader2, X, 
  CheckCircle2, AlertCircle, Ban, Trash2, DollarSign, FileText 
} from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';

interface MaintenanceItem {
  id: string;
  vehicleId: string;
  type?: string;
  status: string;
  title?: string;
  description?: string;
  provider?: string;
  cost?: number | string;
  invoiceRef?: string;
  odometerKm?: number;
  startDate?: string;
  startAt?: string;
  endDate?: string;
  endAt?: string;
  notes?: string;
  vehicle?: {
    id?: string;
    name?: string;
    model?: string;
    brand: string;
    plate?: string;
    licensePlate?: string;
  };
}

interface VehicleOption {
  id: string;
  name?: string;
  model?: string;
  brand: string;
  plate?: string;
  licensePlate?: string;
}

export default function AdminMaintenancePage() {
  const [records, setRecords] = useState<MaintenanceItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [vehicleId, setVehicleId] = useState('');
  const [type, setType] = useState('PREVENTIVO');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('');
  const [cost, setCost] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [odometerKm, setOdometerKm] = useState('');
  const [blocksAvailability, setBlocksAvailability] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const showFeedbackMsg = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, vRes] = await Promise.all([
        fetch('/api/maintenance', { headers: getAuthHeaders() }),
        fetch('/api/fleet/vehicles', { headers: getAuthHeaders() }),
      ]);
      if (mRes.ok) {
        const mData = await mRes.json();
        setRecords(Array.isArray(mData) ? mData : mData.records || []);
      }
      if (vRes.ok) {
        const vData = await vRes.json();
        const vList = Array.isArray(vData) ? vData : vData.vehicles || [];
        setVehicles(vList);
        if (vList.length > 0 && !vehicleId) {
          setVehicleId(vList[0].id);
        }
      }
    } catch (e) {
      console.error(e);
      showFeedbackMsg('error', 'Error al consultar registros de taller');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !description || !startDate) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          vehicleId,
          type,
          description: description.trim(),
          provider: provider.trim() || undefined,
          cost: parseFloat(cost) || 0,
          odometerKm: odometerKm ? parseInt(odometerKm, 10) : undefined,
          startAt: `${startDate}T08:00:00.000Z`,
          endAt: endDate ? `${endDate}T18:00:00.000Z` : undefined,
          blocksAvailability,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Error al programar mantenimiento');
      }

      showFeedbackMsg('success', 'Mantenimiento registrado y calendario bloqueado correctamente.');
      setShowModal(false);
      setDescription('');
      setProvider('');
      setOdometerKm('');
      loadData();
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'Error al guardar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (m: MaintenanceItem) => {
    const notes = prompt('Ingresa observaciones finales de entrega del taller (opcional):', 'Servicio completado satisfactoriamente.');
    if (notes === null) return;

    try {
      const res = await fetch(`/api/maintenance/${m.id}/complete`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Error al completar servicio');
      }
      showFeedbackMsg('success', 'Mantenimiento completado. La unidad ha retornado a estado OPERATIVO.');
      loadData();
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'Error al completar');
    }
  };

  const handleCancel = async (m: MaintenanceItem) => {
    const confirmed = confirm('¿Deseas cancelar este mantenimiento? La unidad retornará a estado OPERATIVO y el bloqueo será liberado.');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/maintenance/${m.id}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes: 'Cancelado desde panel administrativo' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Error al cancelar mantenimiento');
      }
      showFeedbackMsg('success', 'Mantenimiento cancelado y bloqueo liberado.');
      loadData();
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'Error al cancelar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-luxem-night">Taller y Mantenimiento</h1>
          <p className="text-xs text-luxem-night/60 mt-1">
            CRUD de servicios preventivos, cambio de aceite, reparaciones y bloqueos mecánicos
          </p>
        </div>
        <button
          onClick={() => {
            if (vehicles.length > 0 && !vehicleId) setVehicleId(vehicles[0].id);
            setShowModal(true);
          }}
          className="bg-luxem-primary hover:bg-luxem-accent text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Programar Mantenimiento
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Table */}
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
                  <th className="py-3.5 px-4">Tipo / Descripción</th>
                  <th className="py-3.5 px-4">Taller / Proveedor</th>
                  <th className="py-3.5 px-4">Fechas</th>
                  <th className="py-3.5 px-4">Costo Estimado</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => {
                  const vBrand = r.vehicle?.brand || '';
                  const vModel = r.vehicle?.model || r.vehicle?.name || 'Vehículo';
                  const vPlate = r.vehicle?.plate || r.vehicle?.licensePlate || 'S/P';
                  const sDate = r.startAt || r.startDate || '';
                  const eDate = r.endAt || r.endDate || '';
                  const costVal = typeof r.cost === 'number' ? r.cost : parseFloat(String(r.cost || '0'));
                  const isPending = r.status === 'PROGRAMADO' || r.status === 'EN_PROCESO';

                  return (
                    <tr key={r.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-luxem-night">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-luxem-accent flex-shrink-0" />
                          <span>{vBrand} {vModel}</span>
                          <span className="font-mono text-luxem-primary text-[11px]">({vPlate})</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-luxem-night">{r.type || r.title || 'Mantenimiento'}</div>
                        <div className="text-[11px] text-gray-500">{r.description}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {r.provider || 'Taller Central'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>{sDate ? new Date(sDate).toLocaleDateString('es-SV') : 'Inmediato'}</div>
                        {eDate && (
                          <div className="text-[11px] text-gray-400">
                            al {new Date(eDate).toLocaleDateString('es-SV')}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-luxem-night">
                        ${costVal.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            r.status === 'COMPLETADO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'CANCELADO'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleComplete(r)}
                              title="Marcar como completado y retornar a disponible"
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                            >
                              Completar
                            </button>
                            <button
                              onClick={() => handleCancel(r)}
                              title="Cancelar servicio"
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">Finalizado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-luxem-night">Programar Taller / Mantenimiento</h3>
                <p className="text-[11px] text-gray-500">Bloquea fechas en calendario para evitar reservas</p>
              </div>
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
                      {v.brand} {v.model || v.name} ({v.plate || v.licensePlate || 'S/P'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Tipo de Servicio *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="PREVENTIVO">Mantenimiento Preventivo</option>
                  <option value="CAMBIO_ACEITE">Cambio de Aceite y Filtros</option>
                  <option value="FRENOS">Frenos y Pastillas</option>
                  <option value="NEUMATICOS">Llantas / Alineación / Balanceo</option>
                  <option value="BATERIA">Batería y Sistema Eléctrico</option>
                  <option value="CORRECTIVO">Reparación Correctiva / Taller</option>
                  <option value="INSPECCION">Inspección Mecánica Periódica</option>
                  <option value="OTRO">Otro Servicio</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Descripción del Trabajo *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Cambio de aceite 10W-30 sintético y filtro"
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
                  <label className="font-bold text-gray-700 block mb-1">Fecha Estimada Fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Taller / Proveedor</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="Ej: Taller Didea / Lemus"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Costo Estimado (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Kilometraje Actual (km)</label>
                <input
                  type="number"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  placeholder="Ej: 45200"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-luxem-primary hover:bg-luxem-accent disabled:opacity-50 text-white py-3 rounded-xl font-bold transition shadow-sm"
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
