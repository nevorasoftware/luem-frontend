'use client';

import React, { useState, useEffect } from 'react';
import { 
  Car, Plus, Search, CheckCircle2, Wrench, AlertCircle, 
  Loader2, X, Edit, Trash2, Shield, Settings2, Fuel,
  Camera, Image as ImageIcon, Star, Upload, Check
} from 'lucide-react';
import { getAuthHeaders, getAuthHeadersFormData } from '@/lib/auth';

interface VehiclePhotoItem {
  id: string;
  fileId: string;
  url: string;
  sortOrder: number;
  alt?: string;
}

interface LocalPhotoItem {
  file: File;
  previewUrl: string;
  isCover: boolean;
}

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
  photos?: VehiclePhotoItem[];
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
  const [photoManagerVehicle, setPhotoManagerVehicle] = useState<VehicleAdmin | null>(null);

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

  // Photos state
  const [createPhotos, setCreatePhotos] = useState<LocalPhotoItem[]>([]);
  const [editingPhotos, setEditingPhotos] = useState<VehiclePhotoItem[]>([]);
  const [newEditPhotos, setNewEditPhotos] = useState<LocalPhotoItem[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoActionLoadingId, setPhotoActionLoadingId] = useState<string | null>(null);

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
      // Intentar primero con la ruta administrativa para tener inventario completo y fotos
      let res = await fetch('/api/fleet/admin/vehicles', { headers: getAuthHeaders() });
      if (!res.ok) {
        res = await fetch('/api/fleet/vehicles', { headers: getAuthHeaders() });
      }
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

    // Limpiar fotos locales de creación
    createPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setCreatePhotos([]);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    createPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setCreatePhotos([]);
    setShowCreateModal(false);
  };

  const openEditModal = async (v: VehicleAdmin) => {
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

    // Cargar fotos iniciales
    setEditingPhotos(v.photos || []);
    newEditPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setNewEditPhotos([]);

    // Obtener fotos frescas del backend
    try {
      const pRes = await fetch(`/api/fleet/vehicles/${v.id}/photos`, { headers: getAuthHeaders() });
      if (pRes.ok) {
        const freshPhotos = await pRes.json();
        setEditingPhotos(freshPhotos);
      }
    } catch (e) {
      console.error('Error al obtener fotos del vehículo:', e);
    }
  };

  const closeEditModal = () => {
    newEditPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setNewEditPhotos([]);
    setEditingVehicle(null);
  };

  const openPhotoManager = async (v: VehicleAdmin) => {
    setPhotoManagerVehicle(v);
    setEditingPhotos(v.photos || []);
    newEditPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setNewEditPhotos([]);

    try {
      const pRes = await fetch(`/api/fleet/vehicles/${v.id}/photos`, { headers: getAuthHeaders() });
      if (pRes.ok) {
        const freshPhotos = await pRes.json();
        setEditingPhotos(freshPhotos);
      }
    } catch (e) {
      console.error('Error al obtener fotos del vehículo:', e);
    }
  };

  const closePhotoManager = () => {
    newEditPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setNewEditPhotos([]);
    setPhotoManagerVehicle(null);
    loadVehicles();
  };

  // --- Handlers de fotos locales (Creación) ---
  const handleSelectCreatePhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: LocalPhotoItem[] = Array.from(files).map((file, idx) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isCover: createPhotos.length === 0 && idx === 0,
    }));
    setCreatePhotos((prev) => {
      const combined = [...prev, ...newItems];
      if (!combined.some((p) => p.isCover) && combined.length > 0) {
        combined[0].isCover = true;
      }
      return combined;
    });
  };

  const setCreateCoverPhoto = (index: number) => {
    setCreatePhotos((prev) =>
      prev.map((p, idx) => ({
        ...p,
        isCover: idx === index,
      })),
    );
  };

  const removeCreatePhoto = (index: number) => {
    setCreatePhotos((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      const filtered = prev.filter((_, idx) => idx !== index);
      if (removed?.isCover && filtered.length > 0) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  // --- Handlers de fotos locales (Edición) ---
  const handleSelectEditPhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: LocalPhotoItem[] = Array.from(files).map((file, idx) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isCover: editingPhotos.length === 0 && newEditPhotos.length === 0 && idx === 0,
    }));
    setNewEditPhotos((prev) => [...prev, ...newItems]);
  };

  const setNewEditCoverPhoto = (index: number) => {
    setNewEditPhotos((prev) =>
      prev.map((p, idx) => ({
        ...p,
        isCover: idx === index,
      })),
    );
  };

  const removeNewEditPhoto = (index: number) => {
    setNewEditPhotos((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleUploadNewEditPhotos = async (vehicleId: string) => {
    if (newEditPhotos.length === 0) return;
    setUploadingPhotos(true);
    try {
      const formData = new FormData();
      newEditPhotos.forEach((item) => {
        formData.append('files', item.file);
      });
      const coverIdx = newEditPhotos.findIndex((item) => item.isCover);
      if (coverIdx >= 0) {
        formData.append('coverIndex', String(coverIdx));
      }

      const res = await fetch(`/api/fleet/vehicles/${vehicleId}/photos/bulk`, {
        method: 'POST',
        headers: getAuthHeadersFormData(),
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al subir fotos');
      }

      const updatedPhotos = await res.json();
      setEditingPhotos(updatedPhotos);

      // Limpiar fotos locales subidas
      newEditPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setNewEditPhotos([]);

      // Actualizar vehículo en estado global
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, photos: updatedPhotos } : v)),
      );

      showFeedbackMsg('success', 'Fotografías guardadas con éxito en la base de datos');
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'Error al cargar fotos');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSetCoverExistingPhoto = async (vehicleId: string, photoId: string) => {
    setPhotoActionLoadingId(photoId);
    try {
      const res = await fetch(`/api/fleet/vehicles/${vehicleId}/photos/${photoId}/cover`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo cambiar la portada');
      }
      const updatedPhotos = await res.json();
      setEditingPhotos(updatedPhotos);

      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, photos: updatedPhotos } : v)),
      );

      showFeedbackMsg('success', 'Foto establecida como portada principal');
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'Error al establecer portada');
    } finally {
      setPhotoActionLoadingId(null);
    }
  };

  const handleDeleteExistingPhoto = async (vehicleId: string, photoId: string) => {
    const confirmed = confirm('¿Deseas eliminar esta fotografía de la base de datos?');
    if (!confirmed) return;

    setPhotoActionLoadingId(photoId);
    try {
      const res = await fetch(`/api/fleet/photos/${photoId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al eliminar fotografía');
      }

      // Refrescar fotos del vehículo
      const pRes = await fetch(`/api/fleet/vehicles/${vehicleId}/photos`, { headers: getAuthHeaders() });
      const freshPhotos = pRes.ok ? await pRes.json() : editingPhotos.filter((p) => p.id !== photoId);
      setEditingPhotos(freshPhotos);

      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? { ...v, photos: freshPhotos } : v)),
      );

      showFeedbackMsg('success', 'Fotografía eliminada correctamente');
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'Error al eliminar fotografía');
    } finally {
      setPhotoActionLoadingId(null);
    }
  };

  // --- Creación de vehículo + subida de fotos ---
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

      const newVehicleId = data.id;

      // Si se seleccionaron fotos locales, subirlas en bulk
      if (createPhotos.length > 0 && newVehicleId) {
        try {
          const formData = new FormData();
          createPhotos.forEach((p) => {
            formData.append('files', p.file);
          });
          const coverIdx = createPhotos.findIndex((p) => p.isCover);
          formData.append('coverIndex', String(coverIdx >= 0 ? coverIdx : 0));

          await fetch(`/api/fleet/vehicles/${newVehicleId}/photos/bulk`, {
            method: 'POST',
            headers: getAuthHeadersFormData(),
            body: formData,
          });
        } catch (photoErr) {
          console.error('Error al subir fotos en la creación:', photoErr);
        }
      }

      showFeedbackMsg('success', 'Vehículo e imágenes registradas e integradas a la flota con éxito');
      closeCreateModal();
      resetForm();
      loadVehicles();
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'Error al guardar vehículo');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Actualización de vehículo + fotos pendientes ---
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

      // Si hay fotos locales nuevas pendientes de subir, subirlas
      if (newEditPhotos.length > 0) {
        try {
          const formData = new FormData();
          newEditPhotos.forEach((p) => {
            formData.append('files', p.file);
          });
          const coverIdx = newEditPhotos.findIndex((p) => p.isCover);
          if (coverIdx >= 0) {
            formData.append('coverIndex', String(coverIdx));
          }

          await fetch(`/api/fleet/vehicles/${editingVehicle.id}/photos/bulk`, {
            method: 'POST',
            headers: getAuthHeadersFormData(),
            body: formData,
          });
        } catch (pErr) {
          console.error('Error al subir nuevas fotos:', pErr);
        }
      }

      showFeedbackMsg('success', 'Vehículo y especificaciones actualizadas correctamente');
      closeEditModal();
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
            Gestión de catálogo, fotos locales guardadas en base, portada principal, tarifas y disponibilidad operativa
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
            placeholder="Buscar por marca, modelo o placa..."
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
                  <th className="py-3.5 px-4">Vehículo y Portada</th>
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
                  const coverPhoto = v.photos && v.photos.length > 0 ? v.photos[0] : null;
                  const photoCount = v.photos ? v.photos.length : 0;

                  return (
                    <tr key={v.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3 px-4 font-bold text-luxem-night">
                        <div className="flex items-center gap-3">
                          {/* Miniatura de portada */}
                          <div 
                            onClick={() => openPhotoManager(v)}
                            title="Haz clic para ver o cambiar fotos"
                            className="w-14 h-10 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200/90 flex items-center justify-center relative cursor-pointer group shadow-sm hover:ring-2 hover:ring-luxem-primary transition"
                          >
                            {coverPhoto ? (
                              <img
                                src={coverPhoto.url}
                                alt={v.brand}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <Car className="w-5 h-5 text-gray-400 group-hover:text-luxem-primary transition" />
                            )}
                            {photoCount > 0 && (
                              <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-[9px] text-white px-1 py-0.2 rounded font-bold">
                                {photoCount}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{v.brand} {v.model || v.name}</span>
                              <span className="text-[10px] text-gray-400 font-normal">({v.year})</span>
                            </div>
                            <span className="text-[10px] text-luxem-primary font-normal block">
                              {photoCount === 0 ? 'Sin fotos' : `${photoCount} ${photoCount === 1 ? 'foto' : 'fotos'}`}
                            </span>
                          </div>
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

                          {/* Quick Photos button */}
                          <button
                            onClick={() => openPhotoManager(v)}
                            title="Gestionar fotos y portada de la unidad"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition flex items-center gap-1 font-bold text-[10px]"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{photoCount}</span>
                          </button>

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
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-luxem-night">Registrar Nueva Unidad</h3>
                <p className="text-[11px] text-gray-500">Alta de vehículo en el catálogo, carga de fotos locales y selección de portada</p>
              </div>
              <button onClick={closeCreateModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
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

              {/* SECCIÓN DE FOTOGRAFÍAS LOCALES (Creación) */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-luxem-primary" />
                      Fotografías del Vehículo
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Carga fotos desde tu dispositivo. Selecciona una como <strong>Portada Principal</strong>.
                    </p>
                  </div>
                  <label className="cursor-pointer bg-white border border-gray-300 hover:border-luxem-primary text-luxem-primary hover:bg-luxem-primary hover:text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Seleccionar fotos locales</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleSelectCreatePhotos(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {createPhotos.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center bg-white/60">
                    <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                    <p className="text-[11px] text-gray-500 font-medium">
                      No has seleccionado fotos locales para este vehículo.
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Formatos: JPG, PNG, WEBP. Se guardan directamente en la base de datos.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-gray-500 font-medium">
                      {createPhotos.length} {createPhotos.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}. Haz clic en &quot;Marcar Portada&quot; para definir la principal:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {createPhotos.map((p, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border-2 transition shadow-sm bg-white ${
                            p.isCover ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="h-28 w-full bg-gray-100 relative">
                            <img
                              src={p.previewUrl}
                              alt={p.file.name}
                              className="w-full h-full object-cover"
                            />
                            {p.isCover && (
                              <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                                <Star className="w-3 h-3 fill-white" />
                                Portada
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeCreatePhoto(idx)}
                              className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-full shadow transition"
                              title="Quitar foto"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-2 flex items-center justify-between bg-white text-[10px]">
                            <span className="truncate max-w-[85px] text-gray-600 font-medium" title={p.file.name}>
                              {p.file.name}
                            </span>
                            {!p.isCover && (
                              <button
                                type="button"
                                onClick={() => setCreateCoverPhoto(idx)}
                                className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded hover:bg-amber-100 transition"
                                title="Seleccionar como portada principal"
                              >
                                <Star className="w-3 h-3" />
                                Portada
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-luxem-primary hover:bg-luxem-accent disabled:opacity-50 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando vehículo y guardando fotos...
                    </>
                  ) : (
                    'Crear y Publicar Unidad'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-luxem-night">Editar Unidad Vehicular</h3>
                <p className="text-[11px] text-gray-500">Actualizar especificaciones, tarifas, estado operativo y fotos</p>
              </div>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVehicle} className="space-y-4 text-xs">
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

              {/* SECCIÓN DE FOTOGRAFÍAS (Edición) */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-luxem-primary" />
                      Fotografías del Vehículo (Base de Datos)
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Gestiona las fotos guardadas en base o agrega nuevas fotos desde este dispositivo.
                    </p>
                  </div>
                  <label className="cursor-pointer bg-white border border-gray-300 hover:border-luxem-primary text-luxem-primary hover:bg-luxem-primary hover:text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Cargar fotos locales</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleSelectEditPhotos(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Fotos existentes */}
                {editingPhotos.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-gray-700 block">
                      Fotos en la base ({editingPhotos.length}) — La primera con estrella es la portada:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {editingPhotos.map((p) => {
                        const isCover = p.sortOrder === 0;
                        return (
                          <div
                            key={p.id}
                            className={`relative rounded-xl overflow-hidden border-2 transition shadow-sm bg-white ${
                              isCover ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-gray-200'
                            }`}
                          >
                            <div className="h-28 w-full bg-gray-100 relative">
                              <img
                                src={p.url}
                                alt={p.alt || 'Foto vehículo'}
                                className="w-full h-full object-cover"
                              />
                              {isCover ? (
                                <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-white" />
                                  Portada
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverExistingPhoto(editingVehicle.id, p.id)}
                                  disabled={photoActionLoadingId === p.id}
                                  className="absolute top-2 left-2 bg-black/60 hover:bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm transition flex items-center gap-1"
                                >
                                  <Star className="w-3 h-3" />
                                  Portada
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteExistingPhoto(editingVehicle.id, p.id)}
                                disabled={photoActionLoadingId === p.id}
                                className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-full shadow transition"
                                title="Eliminar de la base"
                              >
                                {photoActionLoadingId === p.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No hay fotos guardadas aún para esta unidad.</p>
                )}

                {/* Nuevas fotos locales seleccionadas */}
                {newEditPhotos.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-luxem-primary">
                        Fotos locales pendientes ({newEditPhotos.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUploadNewEditPhotos(editingVehicle.id)}
                        disabled={uploadingPhotos}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-sm"
                      >
                        {uploadingPhotos ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        Subir a la base ahora
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {newEditPhotos.map((p, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border-2 transition shadow-sm bg-white ${
                            p.isCover ? 'border-amber-500' : 'border-gray-200'
                          }`}
                        >
                          <div className="h-24 w-full bg-gray-100 relative">
                            <img src={p.previewUrl} alt={p.file.name} className="w-full h-full object-cover" />
                            {p.isCover && (
                              <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full shadow">
                                Será Portada
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeNewEditPhoto(idx)}
                              className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full shadow"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="p-1.5 flex items-center justify-between text-[10px]">
                            <span className="truncate max-w-[80px] text-gray-500">{p.file.name}</span>
                            {!p.isCover && (
                              <button
                                type="button"
                                onClick={() => setNewEditCoverPhoto(idx)}
                                className="text-amber-600 font-bold hover:underline"
                              >
                                Portada
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-luxem-primary hover:bg-luxem-accent disabled:opacity-50 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando cambios y fotos...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED PHOTO MANAGER MODAL */}
      {photoManagerVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-bold text-lg text-luxem-night flex items-center gap-2">
                  <Camera className="w-5 h-5 text-luxem-primary" />
                  Galería y Fotos — {photoManagerVehicle.brand} {photoManagerVehicle.model || photoManagerVehicle.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Placa: <span className="font-mono font-bold text-luxem-primary">{photoManagerVehicle.plate || photoManagerVehicle.licensePlate || 'S/P'}</span> • Selecciona cuál es la portada y agrega fotos locales
                </p>
              </div>
              <button onClick={closePhotoManager} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dropzone para fotos locales */}
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-luxem-primary/10 flex items-center justify-center text-luxem-primary flex-shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Cargar nuevas fotografías locales</h4>
                  <p className="text-[11px] text-gray-500">Selecciona imágenes desde tu computadora o celular para guardarlas en la base</p>
                </div>
              </div>
              <label className="cursor-pointer bg-luxem-primary hover:bg-luxem-accent text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm whitespace-nowrap">
                <Plus className="w-4 h-4" />
                <span>Seleccionar Fotos</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleSelectEditPhotos(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Fotos locales seleccionadas listas para subir */}
            {newEditPhotos.length > 0 && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">
                    Fotos locales listas para guardar en la base ({newEditPhotos.length})
                  </span>
                  <button
                    onClick={() => handleUploadNewEditPhotos(photoManagerVehicle.id)}
                    disabled={uploadingPhotos}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow"
                  >
                    {uploadingPhotos ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Subir y Guardar Ahora
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {newEditPhotos.map((p, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-amber-300 bg-white">
                      <div className="h-20 w-full relative">
                        <img src={p.previewUrl} alt={p.file.name} className="w-full h-full object-cover" />
                        {p.isCover && (
                          <span className="absolute top-1 left-1 bg-amber-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                            Portada
                          </span>
                        )}
                        <button
                          onClick={() => removeNewEditPhoto(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="p-1 flex items-center justify-between text-[10px]">
                        <span className="truncate max-w-[65px] text-gray-500">{p.file.name}</span>
                        {!p.isCover && (
                          <button onClick={() => setNewEditCoverPhoto(idx)} className="text-amber-600 font-bold hover:underline">
                            Portada
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Galería de fotos existentes en la base */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Fotografías Guardadas ({editingPhotos.length})
                </h4>
                <span className="text-[11px] text-gray-400">
                  La foto con la estrella dorada es la portada del catálogo
                </span>
              </div>

              {editingPhotos.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-600">Este vehículo no tiene fotografías asignadas</p>
                  <p className="text-[11px] text-gray-400 mt-1">Usa el botón de arriba para cargar fotos locales desde este dispositivo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {editingPhotos.map((p) => {
                    const isCover = p.sortOrder === 0;
                    return (
                      <div
                        key={p.id}
                        className={`relative rounded-2xl overflow-hidden border-2 transition shadow-sm bg-white group ${
                          isCover ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="h-36 w-full bg-gray-100 relative">
                          <img src={p.url} alt={p.alt || 'Foto vehículo'} className="w-full h-full object-cover" />
                          {isCover ? (
                            <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-white" />
                              Portada Principal
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetCoverExistingPhoto(photoManagerVehicle.id, p.id)}
                              disabled={photoActionLoadingId === p.id}
                              className="absolute top-2 left-2 bg-black/65 hover:bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm transition flex items-center gap-1 shadow"
                            >
                              <Star className="w-3.5 h-3.5" />
                              Marcar Portada
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteExistingPhoto(photoManagerVehicle.id, p.id)}
                            disabled={photoActionLoadingId === p.id}
                            className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full shadow transition"
                            title="Eliminar foto de la base"
                          >
                            {photoActionLoadingId === p.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t pt-4 flex justify-end">
              <button
                onClick={closePhotoManager}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-xs transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
