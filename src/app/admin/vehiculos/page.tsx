'use client';

import React, { useState, useEffect } from 'react';
import { Car, Plus, Search, CheckCircle2, Wrench, AlertCircle, Loader2, X } from 'lucide-react';

interface VehicleAdmin {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  dailyPrice: number;
  securityDeposit: number;
  status: string;
  category: { name: string };
  transmission: string;
  seats: number;
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New vehicle form
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [licensePlate, setLicensePlate] = useState('');
  const [dailyPrice, setDailyPrice] = useState('45');
  const [securityDeposit, setSecurityDeposit] = useState('400');
  const [transmission, setTransmission] = useState('AUTOMATICA');
  const [seats, setSeats] = useState('5');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fleet/vehicles');
      if (res.ok) {
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : data.vehicles || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (vehicleId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/fleet/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadVehicles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/fleet/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          brand,
          model,
          year: parseInt(year, 10),
          licensePlate,
          dailyPrice: Math.round(parseFloat(dailyPrice) * 100),
          securityDeposit: Math.round(parseFloat(securityDeposit) * 100),
          transmission,
          seats: parseInt(seats, 10),
          fuelType: 'GASOLINA',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al crear vehículo');
      }

      alert('Vehículo creado correctamente');
      setShowCreateModal(false);
      loadVehicles();
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-luxem-night">Flota y Vehículos</h1>
          <p className="text-xs text-luxem-night/60 mt-1">
            Gestión de unidades, estados operativos, tarifas y mantenimientos
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-luxem-primary hover:bg-luxem-accent text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Unidad
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo o placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary"
          />
        </div>
      </div>

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
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Cambiar Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-luxem-night">
                      {v.brand} {v.name} ({v.year})
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-luxem-primary">
                      {v.licensePlate}
                    </td>
                    <td className="py-3.5 px-4">{v.category?.name || 'SUV'}</td>
                    <td className="py-3.5 px-4">{v.transmission}</td>
                    <td className="py-3.5 px-4 font-bold text-luxem-night">
                      ${(v.dailyPrice / 100).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      ${(v.securityDeposit / 100).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          v.status === 'DISPONIBLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'MANTENIMIENTO'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {v.status !== 'DISPONIBLE' && (
                        <button
                          onClick={() => handleUpdateStatus(v.id, 'DISPONIBLE')}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold"
                        >
                          Disponible
                        </button>
                      )}
                      {v.status !== 'MANTENIMIENTO' && (
                        <button
                          onClick={() => handleUpdateStatus(v.id, 'MANTENIMIENTO')}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-bold"
                        >
                          Taller
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-luxem-night">Registrar Nueva Unidad</h3>
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
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nombre / Línea *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Corolla Cross"
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
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Placa *</label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="P-123456"
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Pasajeros</label>
                  <input
                    type="number"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Tarifa Diaria (USD) *</label>
                  <input
                    type="number"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Depósito (USD) *</label>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-luxem-primary hover:bg-luxem-accent text-white py-3 rounded-xl font-bold transition"
                >
                  {actionLoading ? 'Guardando...' : 'Crear y Publicar Unidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
