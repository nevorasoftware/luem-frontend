'use client';

import React, { useState, useEffect } from 'react';
import { 
  Car, Plus, Search, CheckCircle2, Wrench, AlertCircle, 
  Loader2, X, Edit, Trash2, Shield, Settings2, Fuel 
} from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';

interface VehicleAdmin {
  id: string;
  name?: string;
  brand: string;
  model: string;
  year: number;
  plate?: string;
  licensePlate?: string;
  dailyRate?: number;
  dailyPrice?: number;
  securityDeposit?: number;
  depositAmount?: number;
  operationalStatus?: string;
  status?: string;
  category?: { id?: string; name: string };
  categoryId?: string;
  transmission?: string;
  passengers?: number;
  seats?: number;
  fuelType?: string;
  active?: boolean;
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleAdmin | null>(null);

  // Form fields
  const [formBrand, setFormBrand] = useState('Toyota');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState('2024');
  const [formPlate, setFormPlate] = useState('');
  const [formDailyPrice, setFormDailyPrice] = useState('45');
  const [formSecurityDeposit, setFormSecurityDeposit] = useState('400');
  const [formTransmission, setFormTransmission] = useState('AUTOMATICA');
  const [formSeats, setFormSeats] = useState('5');
  const [formFuelType, setFormFuelType] = useState('GASOLINA');
  const [formStatus, setFormStatus] = useState('OPERATIVO');

  useEffect(() => {
    loadVehicles();
  }, []);

  const showFeedbackMsg = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fleet/vehicles', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : data.vehicles || []);
      }
    } catch (e) {
      console.error(e);
      showFeedbackMsg('error', 'Error al cargar el inventario de vehículos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormBrand('Toyota');
    setFormModel('');
    setFormYear('2024');
    setFormPlate('');
    setFormDailyPrice('45');
    setFormSecurityDeposit('400');
    setFormTransmission('AUTOMATICA');
    setFormSeats('5');
    setFormFuelType('GASOLINA');
    setFormStatus('OPERATIVO');
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (v: VehicleAdmin) => {
    setEditingVehicle(v);
    setFormBrand(v.brand || '');
    setFormModel(v.model || v.name || '');
    setFormYear(String(v.year || 2024));
    setFormPlate(v.plate || v.licensePlate || '');
    const rate = Number(v.dailyRate ?? (v.dailyPrice ? v.dailyPrice / 100 : 45));
    const deposit = Number(v.depositAmount ?? (v.securityDeposit ? v.securityDeposit / 100 : 400));
    setFormDailyPrice(String(rate));
    setFormSecurityDeposit(String(deposit));
    setFormTransmission(v.transmission || 'AUTOMATICA');
    setFormSeats(String(v.passengers || v.seats || 5));
    setFormFuelType(v.fuelType || 'GASOLINA');
    setFormStatus(v.operationalStatus || v.status || 'OPERATIVO');
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/fleet/vehicles', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          brand: formBrand.trim(),
          model: formModel.trim(),
          name: formModel.trim(),
          year: parseInt(formYear, 10),
          plate: formPlate.trim().toUpperCase(),
          licensePlate: formPlate.trim().toUpperCase(),
          dailyPrice: Math.round(parseFloat(formDailyPrice) * 100),
          dailyRate: parseFloat(formDailyPrice),
          securityDeposit: Math.round(parseFloat(formSecurityDeposit) * 100),
          depositAmount: parseFloat(formSecurityDeposit),
          transmission: formTransmission,
          seats: parseInt(formSeats, 10),
          passengers: parseInt(formSeats, 10),
          fuelType: formFuelType,
          operationalStatus: formStatus,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Error al crear unidad vehicular');
      }

      showFeedbackMsg('success', 'Vehículo registrado e integrado a la flota con éxito');
      setShowCreateModal(false);
      resetForm();
      loadVehicles();
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'Error al guardar vehículo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/fleet/vehicles/${editingVehicle.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          brand: formBrand.trim(),
          model: formModel.trim(),
          name: formModel.trim(),
          year: parseInt(formYear, 10),
          plate: formPlate.trim().toUpperCase(),
          licensePlate: formPlate.trim().toUpperCase(),
          dailyPrice: Math.round(parseFloat(formDailyPrice) * 100),
          dailyRate: parseFloat(formDailyPrice),
          securityDeposit: Math.round(parseFloat(formSecurityDeposit) * 100),
          depositAmount: parseFloat(formSecurityDeposit),
          transmission: formTransmission,
          seats: parseInt(formSeats, 10),
          passengers: parseInt(formSeats, 10),
          fuelType: formFuelType,
          operationalStatus: formStatus,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar vehículo');
      }

      showFeedbackMsg('success', 'Vehículo actualizado correctamente');
      setEditingVehicle(null);
      resetForm();
      loadVehicles();
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'Error al actualizar vehículo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicle: VehicleAdmin) => {
    const vName = `${vehicle.brand} ${vehicle.model || vehicle.name} (${vehicle.plate || vehicle.licensePlate || 'S/P'})`;
    const confirmed = confirm(
      `¿Deseas eliminar o dar de baja a la unidad "${vName}"?\n\nSi la unidad posee reservas o mantenimientos históricos, el sistema preservará la trazabilidad contable y desactivará la unidad del catálogo público.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/fleet/vehicles/${vehicle.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Error al eliminar unidad');
      }
      showFeedbackMsg('success', data.message || 'Unidad eliminada o desactivada correctamente');
      loadVehicles();
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'Error al procesar eliminación');
    }
  };

  const handleQuickStatus = async (vehicleId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/fleet/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          status: newStatus,
          operationalStatus: newStatus 
        }),
      });
      if (res.ok) {
        showFeedbackMsg('success', `Estado actualizado a ${newStatus}`);
        loadVehicles();
      } else {
        const err = await res.json().catch(() => ({}));
        showFeedbackMsg('error', err.message || 'No se pudo cambiar el estado');
      }
    } catch (e) {
      console.error(e);
      showFeedbackMsg('error', 'Error de conexión');
    }
  };

  const filtered = vehicles.filter((v) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const brand = (v.brand || '').toLowerCase();
    const model = (v.model || v.name || '').toLowerCase();
    const plate = (v.plate || v.licensePlate || '').toLowerCase();
    const category = (v.category?.name || '').toLowerCase();
    return brand.includes(q) || model.includes(q) || plate.includes(q) || category.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-luxem-night">Flota y Vehículos</h1>
          <p className="text-xs text-luxem-night/60 mt-1">
            CRUD completo de catálogo, edición de tarifas diarias, depósitos y disponibilidad operativa
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-luxem-primary hover:bg-luxem-accent text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Unidad
        </button>
      </div>

      {/* Feedback Alert */}
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo o placa salvadoreña..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary"
          />
        </div>
        <div className="text-[11px] font-bold text-luxem-night/50 hidden sm:block">
          Inventario: {filtered.length} {filtered.length === 1 ? 'unidad' : 'unidades'}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-luxem-accent animate-spin mx-auto mb-2" />
            <p className="text-xs text-luxem-night/60">Cargando flota...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm font-bold text-luxem-night">
            No se encontraron vehículos en el inventario
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-luxem-night/60 border-b border-gray-100 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Vehículo</th>
                  <th className="py-3.5 px-4">Placa</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Transmisión</th>
                  <th className="py-3.5 px-4">Tarifa / Día</th>
                  <th className="py-3.5 px-4">Depósito</th>
                  <th className="py-3.5 px-4">Estado Operativo</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((v) => {
                  const currentStatus = v.operationalStatus || v.status || 'OPERATIVO';
                  const rate = Number(v.dailyRate ?? (v.dailyPrice ? v.dailyPrice / 100 : 0));
                  const deposit = Number(v.depositAmount ?? (v.securityDeposit ? v.securityDeposit / 100 : 0));
                  const isAvailable = currentStatus === 'OPERATIVO' || currentStatus === 'DISPONIBLE';
                  const isMaintenance = currentStatus === 'EN_MANTENIMIENTO' || currentStatus === 'MANTENIMIENTO';

                  return (
                    <tr key={v.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-luxem-night">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-luxem-accent flex-shrink-0" />
                          <span>{v.brand} {v.model || v.name}</span>
                          <span className="text-[10px] text-gray-400 font-normal">({v.year})</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-luxem-primary">
                        {v.plate || v.licensePlate || 'S/P'}
                      </td>
                      <td className="py-3.5 px-4">{v.category?.name || 'SUV / Sedán'}</td>
                      <td className="py-3.5 px-4">{v.transmission || 'AUTOMATICA'}</td>
                      <td className="py-3.5 px-4 font-bold text-luxem-night">
                        ${rate.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        ${deposit.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : isMaintenance
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Toggle Status */}
                          {isMaintenance ? (
                            <button
                              onClick={() => handleQuickStatus(v.id, 'OPERATIVO')}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                            >
                              Habilitar
                            </button>
                          ) : isAvailable ? (
                            <button
                              onClick={() => handleQuickStatus(v.id, 'EN_MANTENIMIENTO')}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
                            >
                              Taller
                            </button>
                          ) : null}

                          {/* Edit button */}
                          <button
                            onClick={() => openEditModal(v)}
                            title="Editar especificaciones y tarifas"
                            className="p-1.5 bg-gray-50 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteVehicle(v)}
                            title="Eliminar o desactivar unidad"
                            className="p-1.5 bg-red-50 hover:bg-red-200 text-red-600 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-luxem-night">Registrar Nueva Unidad</h3>
                <p className="text-[11px] text-gray-500">Alta de vehículo en el catálogo y sistema de reservas</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Marca *</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="Toyota, Kia, Hyundai..."
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Modelo / Línea *</label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="Corolla Cross, Tucson, etc."
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Año *</label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Placa *</label>
                  <input
                    type="text"
                    value={formPlate}
                    onChange={(e) => setFormPlate(e.target.value)}
                    placeholder="P-123456"
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Pasajeros</label>
                  <input
                    type="number"
                    value={formSeats}
                    onChange={(e) => setFormSeats(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Transmisión *</label>
                  <select
                    value={formTransmission}
                    onChange={(e) => setFormTransmission(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="AUTOMATICA">Automática</option>
                    <option value="MANUAL">Manual / Estándar</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Combustible</label>
                  <select
                    value={formFuelType}
                    onChange={(e) => setFormFuelType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="GASOLINA">Gasolina</option>
                    <option value="DIESEL">Diésel</option>
                    <option value="HIBRIDO">Híbrido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tarifa Diaria (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formDailyPrice}
                    onChange={(e) => setFormDailyPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Depósito en Garantía (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formSecurityDeposit}
                    onChange={(e) => setFormSecurityDeposit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Estado Operativo Inicial</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="OPERATIVO">OPERATIVO (Disponible para reservas)</option>
                  <option value="EN_MANTENIMIENTO">EN_MANTENIMIENTO (Taller)</option>
                  <option value="FUERA_DE_SERVICIO">FUERA_DE_SERVICIO (Inactivo)</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-luxem-primary hover:bg-luxem-accent disabled:opacity-50 text-white py-3 rounded-xl font-bold transition"
                >
                  {actionLoading ? 'Registrando...' : 'Crear y Publicar Unidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-luxem-night">Editar Unidad Vehicular</h3>
                <p className="text-[11px] text-gray-500">Actualizar especificaciones, tarifas o estado operativo</p>
              </div>
              <button onClick={() => setEditingVehicle(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVehicle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Marca *</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Modelo / Línea *</label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Año *</label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Placa *</label>
                  <input
                    type="text"
                    value={formPlate}
                    onChange={(e) => setFormPlate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Pasajeros</label>
                  <input
                    type="number"
                    value={formSeats}
                    onChange={(e) => setFormSeats(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Transmisión *</label>
                  <select
                    value={formTransmission}
                    onChange={(e) => setFormTransmission(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="AUTOMATICA">Automática</option>
                    <option value="MANUAL">Manual / Estándar</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Combustible</label>
                  <select
                    value={formFuelType}
                    onChange={(e) => setFormFuelType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="GASOLINA">Gasolina</option>
                    <option value="DIESEL">Diésel</option>
                    <option value="HIBRIDO">Híbrido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tarifa Diaria (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formDailyPrice}
                    onChange={(e) => setFormDailyPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Depósito en Garantía (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formSecurityDeposit}
                    onChange={(e) => setFormSecurityDeposit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Estado Operativo</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="OPERATIVO">OPERATIVO (Disponible para reservas)</option>
                  <option value="EN_MANTENIMIENTO">EN_MANTENIMIENTO (Taller)</option>
                  <option value="FUERA_DE_SERVICIO">FUERA_DE_SERVICIO (Inactivo)</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-luxem-primary hover:bg-luxem-accent disabled:opacity-50 text-white py-3 rounded-xl font-bold transition"
                >
                  {actionLoading ? 'Actualizando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
