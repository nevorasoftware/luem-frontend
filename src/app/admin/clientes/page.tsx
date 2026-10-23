'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldAlert, ShieldCheck, Phone, Mail, 
  Loader2, Plus, Edit, Trash2, X, CheckCircle2, AlertCircle, FileText 
} from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';

interface CustomerAdmin {
  id: string;
  fullName: string;
  dui?: string;
  documentNumber?: string;
  documentType?: string;
  email?: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  notes?: string;
  blocked?: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
  blockReason?: string;
  createdAt?: string;
  _count?: {
    reservations?: number;
    requests?: number;
    bookingRequests?: number;
  };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerAdmin | null>(null);

  // Form fields
  const [formFullName, setFormFullName] = useState('');
  const [formDui, setFormDui] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLicenseNumber, setFormLicenseNumber] = useState('');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const showFeedbackMsg = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : data.customers || []);
      }
    } catch (e) {
      console.error(e);
      showFeedbackMsg('error', 'Error al sincronizar lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormFullName('');
    setFormDui('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormLicenseNumber('');
    setFormNotes('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (c: CustomerAdmin) => {
    setEditingCustomer(c);
    setFormFullName(c.fullName || '');
    setFormDui(c.dui || c.documentNumber || '');
    setFormPhone(c.phone || '');
    setFormEmail(c.email || '');
    setFormAddress(c.address || '');
    setFormLicenseNumber(c.licenseNumber || '');
    setFormNotes(c.notes || '');
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullName: formFullName.trim(),
          dui: formDui.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim().toLowerCase(),
          address: formAddress.trim(),
          licenseNumber: formLicenseNumber.trim() || undefined,
          notes: formNotes.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar cliente');
      }

      showFeedbackMsg('success', 'Cliente creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      loadCustomers();
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'No se pudo crear el cliente');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullName: formFullName.trim(),
          dui: formDui.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim().toLowerCase(),
          address: formAddress.trim(),
          licenseNumber: formLicenseNumber.trim() || undefined,
          notes: formNotes.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar cliente');
      }

      showFeedbackMsg('success', 'Información de cliente actualizada');
      setEditingCustomer(null);
      resetForm();
      loadCustomers();
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'No se pudo actualizar el cliente');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCustomer = async (customer: CustomerAdmin) => {
    const confirmed = confirm(
      `¿Deseas eliminar o dar de baja al cliente "${customer.fullName}"?\n\nSi tiene contratos históricos asociados, el sistema preservará los registros contables y lo marcará como Inactivo.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'No se pudo eliminar el cliente');
      }
      showFeedbackMsg('success', data.message || 'Cliente eliminado correctamente');
      loadCustomers();
    } catch (err: any) {
      showFeedbackMsg('error', err.message || 'Error al eliminar cliente');
    }
  };

  const toggleBlock = async (customer: CustomerAdmin) => {
    const isCurrentlyBlocked = Boolean(customer.blocked ?? customer.isBlocked);
    let reason = '';
    if (!isCurrentlyBlocked) {
      const promptRes = prompt('Ingresa el motivo del bloqueo (ej: Daños no pagados, morosidad):');
      if (promptRes === null) return;
      reason = promptRes.trim();
    }

    try {
      const res = await fetch(`/api/customers/${customer.id}/block`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          isBlocked: !isCurrentlyBlocked,
          blockReason: reason,
          blocked: !isCurrentlyBlocked,
          blockedReason: reason,
        }),
      });
      if (res.ok) {
        showFeedbackMsg(
          'success',
          isCurrentlyBlocked ? 'Cliente desbloqueado y habilitado' : 'Cliente bloqueado por seguridad'
        );
        loadCustomers();
      } else {
        const err = await res.json().catch(() => ({}));
        showFeedbackMsg('error', err.message || 'No se pudo modificar el bloqueo');
      }
    } catch (e) {
      console.error(e);
      showFeedbackMsg('error', 'Error al procesar bloqueo');
    }
  };

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const name = (c.fullName || '').toLowerCase();
    const doc = (c.dui || c.documentNumber || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    return name.includes(q) || doc.includes(q) || email.includes(q) || phone.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-luxem-night">Directorio de Clientes</h1>
          <p className="text-xs text-luxem-night/60 mt-1">
            CRUD integral de clientes, verificación de DUI, riesgo y mantenimiento
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-luxem-primary hover:bg-luxem-accent text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
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

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, DUI, teléfono o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary"
          />
        </div>
        <div className="text-[11px] font-bold text-luxem-night/50 hidden sm:block">
          Total: {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-luxem-accent animate-spin mx-auto mb-2" />
            <p className="text-xs text-luxem-night/60">Cargando clientes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm font-bold text-luxem-night">
            No se encontraron clientes registrados con ese criterio
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-luxem-night/60 border-b border-gray-100 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">DUI / Documento</th>
                  <th className="py-3.5 px-4">Contacto</th>
                  <th className="py-3.5 px-4">Dirección</th>
                  <th className="py-3.5 px-4">Historial</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => {
                  const isBlocked = Boolean(c.blocked ?? c.isBlocked);
                  const docNumber = c.dui || c.documentNumber || 'S/D';
                  const resCount = c._count?.reservations ?? c._count?.bookingRequests ?? c._count?.requests ?? 0;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-luxem-night">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-luxem-accent flex-shrink-0" />
                          <span>{c.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-luxem-primary">
                        {docNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{c.email || 'Sin correo'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{c.phone || 'Sin teléfono'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate" title={c.address || ''}>
                        {c.address || 'San Salvador, El Salvador'}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-[10px]">
                          {resCount} contratos
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isBlocked ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            Bloqueado
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => openEditModal(c)}
                            title="Editar datos del cliente"
                            className="p-1.5 bg-gray-50 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Block/Unblock button */}
                          <button
                            onClick={() => toggleBlock(c)}
                            title={isBlocked ? 'Desbloquear cliente' : 'Bloquear cliente'}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                              isBlocked
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isBlocked ? 'Desbloquear' : 'Bloquear'}
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteCustomer(c)}
                            title="Eliminar cliente"
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
                <h3 className="font-bold text-lg text-luxem-night">Registrar Nuevo Cliente</h3>
                <p className="text-[11px] text-gray-500">Formulario con validación de DUI oficial de El Salvador</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Ej: Jonathan Giron"
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">DUI *</label>
                  <input
                    type="text"
                    value={formDui}
                    onChange={(e) => setFormDui(e.target.value)}
                    placeholder="00000000-0"
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Teléfono *</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+503 7000-0000"
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">N° Licencia de Conducir</label>
                  <input
                    type="text"
                    value={formLicenseNumber}
                    onChange={(e) => setFormLicenseNumber(e.target.value)}
                    placeholder="0000-000000-000-0"
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Dirección Residencial *</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Colonia, Calle, Ciudad, Departamento"
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Notas / Observaciones</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Detalles sobre el cliente o preferencias..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-luxem-primary hover:bg-luxem-accent disabled:opacity-50 text-white py-3 rounded-xl font-bold transition"
                >
                  {actionLoading ? 'Registrando...' : 'Guardar y Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-luxem-night">Editar Cliente</h3>
                <p className="text-[11px] text-gray-500">Modificar información personal y contacto</p>
              </div>
              <button onClick={() => setEditingCustomer(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">DUI *</label>
                  <input
                    type="text"
                    value={formDui}
                    onChange={(e) => setFormDui(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Teléfono *</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">N° Licencia de Conducir</label>
                  <input
                    type="text"
                    value={formLicenseNumber}
                    onChange={(e) => setFormLicenseNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Dirección Residencial *</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Notas / Observaciones</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
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
