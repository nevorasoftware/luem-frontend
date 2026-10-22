'use client';

import React, { useState, useEffect } from 'react';
import { 
  Inbox, Search, Filter, Eye, CheckCircle2, XCircle, 
  AlertTriangle, FileText, Loader2, Calendar, MapPin, User, Car, X, ExternalLink 
} from 'lucide-react';

interface RequestItem {
  id: string;
  code?: string;
  requestCode?: string;
  status: string;
  pickupAt?: string;
  returnAt?: string;
  pickupDate?: string;
  returnDate?: string;
  pickupLocation?: string | { name: string };
  returnLocation?: string | { name: string };
  estimatedTotal?: number;
  totalAmount?: number;
  securityDeposit?: number;
  reviewNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  customer?: {
    id: string;
    fullName: string;
    dui?: string;
    documentNumber?: string;
    email: string;
    phone: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  };
  vehicle?: {
    id: string;
    name?: string;
    brand: string;
    model: string;
    year: number;
    plate?: string;
    licensePlate?: string;
  };
  documents?: {
    id: string;
    documentType: string;
    status: string;
    filename?: string;
    file?: { originalName?: string; url?: string };
  }[];
}

interface VehicleOption {
  id: string;
  name?: string;
  model?: string;
  brand: string;
  plate?: string;
  licensePlate?: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('TODAS');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected request modal
  const [selectedReq, setSelectedReq] = useState<RequestItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Action fields
  const [approveVehicleId, setApproveVehicleId] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [requestInfoNotes, setRequestInfoNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'APPROVE' | 'REQUEST_INFO' | 'REJECT'>('DETAILS');

  useEffect(() => {
    loadRequests();
    loadVehicles();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const res = await fetch('/api/fleet/vehicles');
      if (res.ok) {
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : data.vehicles || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenModal = (req: RequestItem) => {
    setSelectedReq(req);
    setApproveVehicleId(req.vehicle?.id || '');
    setActiveTab('DETAILS');
    setApproveNotes('');
    setRequestInfoNotes('');
    setRejectionReason('');
  };

  const handleApprove = async () => {
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/requests/${selectedReq.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: approveVehicleId || selectedReq.vehicle?.id || '',
          internalNotes: approveNotes,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al aprobar solicitud');
      }

      alert('¡Solicitud aprobada con éxito! Se generó la reserva y se notificó al cliente.');
      setSelectedReq(null);
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'Error al aprobar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedReq || !requestInfoNotes) {
      alert('Por favor especifica qué documentos o información adicional requieres.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/requests/${selectedReq.id}/request-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: requestInfoNotes }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al solicitar información');
      }

      alert('Se ha enviado la notificación de información requerida al cliente.');
      setSelectedReq(null);
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'Error al solicitar info');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReq || !rejectionReason) {
      alert('Por favor ingresa el motivo del rechazo.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/requests/${selectedReq.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al rechazar solicitud');
      }

      alert('Solicitud rechazada y notificada al cliente.');
      setSelectedReq(null);
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'Error al rechazar');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'TODAS' || r.status === statusFilter;
    if (!searchQuery.trim()) return matchesStatus;
    const q = searchQuery.trim().toLowerCase();
    const code = (r.code || r.requestCode || '').toLowerCase();
    const customer = (r.customer?.fullName || '').toLowerCase();
    const dui = (r.customer?.dui || r.customer?.documentNumber || '').toLowerCase();
    const vehicle = (r.vehicle?.model || r.vehicle?.name || r.vehicle?.brand || '').toLowerCase();
    const matchesSearch = code.includes(q) || customer.includes(q) || dui.includes(q) || vehicle.includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-luxem-night">Bandeja de Solicitudes</h1>
          <p className="text-xs text-luxem-night/60 mt-1">
            Revisión documental, validación de identidad y aprobación de solicitudes
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por código, cliente o DUI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary"
            />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['TODAS', 'PENDIENTE_REVISION', 'DOCUMENTACION_INCOMPLETA', 'APROBADA', 'RECHAZADA'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                statusFilter === st
                  ? 'bg-luxem-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-luxem-accent animate-spin mx-auto mb-2" />
            <p className="text-xs text-luxem-night/60">Cargando solicitudes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-20 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-luxem-night">No hay solicitudes en esta categoría</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-luxem-night/60 border-b border-gray-100 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Cliente / DUI</th>
                  <th className="py-3.5 px-4">Vehículo</th>
                  <th className="py-3.5 px-4">Fechas</th>
                  <th className="py-3.5 px-4">Monto</th>
                  <th className="py-3.5 px-4">Docs</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => {
                  const reqCode = req.code || req.requestCode || 'SOL';
                  const custName = req.customer?.fullName || 'Cliente General';
                  const custDoc = req.customer?.dui || req.customer?.documentNumber || 'S/D';
                  const vBrand = req.vehicle?.brand || '';
                  const vModel = req.vehicle?.model || req.vehicle?.name || 'Vehículo';
                  const vYear = req.vehicle?.year || '';
                  const pDate = req.pickupAt || req.pickupDate;
                  const rDate = req.returnAt || req.returnDate;
                  const total = Number(req.estimatedTotal ?? (req.totalAmount ? (req.totalAmount > 1000 ? req.totalAmount / 100 : req.totalAmount) : 0));
                  const docsCount = Array.isArray(req.documents) ? req.documents.length : 0;

                  return (
                    <tr key={req.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-luxem-primary">
                        {reqCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-luxem-night">{custName}</div>
                        <div className="text-[11px] text-gray-400 font-mono">DUI: {custDoc}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-luxem-night">
                          {vBrand} {vModel}
                        </div>
                        <div className="text-[11px] text-gray-400">{vYear}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>{pDate ? new Date(pDate).toLocaleDateString('es-SV') : 'N/D'}</div>
                        <div className="text-[11px] text-gray-400">
                          al {rDate ? new Date(rDate).toLocaleDateString('es-SV') : 'N/D'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-luxem-night">
                        ${total.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md text-[11px]">
                          <FileText className="w-3 h-3 text-luxem-accent" />
                          {docsCount} archivos
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            req.status === 'APROBADA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'PENDIENTE_REVISION'
                              ? 'bg-blue-100 text-blue-800'
                              : req.status === 'DOCUMENTACION_INCOMPLETA'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenModal(req)}
                          className="bg-luxem-night hover:bg-luxem-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Revisar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReq && (() => {
        const sCode = selectedReq.code || selectedReq.requestCode || 'SOL';
        const sCustName = selectedReq.customer?.fullName || 'Cliente General';
        const sCustDoc = selectedReq.customer?.dui || selectedReq.customer?.documentNumber || 'S/D';
        const sEmail = selectedReq.customer?.email || 'Sin correo';
        const sPhone = selectedReq.customer?.phone || 'Sin teléfono';
        const sAddress = selectedReq.customer?.address || 'N/A';
        const sEmergName = selectedReq.customer?.emergencyContactName || 'N/A';
        const sEmergPhone = selectedReq.customer?.emergencyContactPhone || '';
        const sVBrand = selectedReq.vehicle?.brand || '';
        const sVModel = selectedReq.vehicle?.model || selectedReq.vehicle?.name || 'Vehículo';
        const sPDate = selectedReq.pickupAt || selectedReq.pickupDate;
        const sRDate = selectedReq.returnAt || selectedReq.returnDate;
        const sPLoc = typeof selectedReq.pickupLocation === 'object' ? selectedReq.pickupLocation?.name : (selectedReq.pickupLocation || 'Sucursal Principal');
        const sRLoc = typeof selectedReq.returnLocation === 'object' ? selectedReq.returnLocation?.name : (selectedReq.returnLocation || 'Sucursal Principal');
        const sTotal = Number(selectedReq.estimatedTotal ?? (selectedReq.totalAmount ? (selectedReq.totalAmount > 1000 ? selectedReq.totalAmount / 100 : selectedReq.totalAmount) : 0));
        const sDeposit = Number(selectedReq.securityDeposit ? (selectedReq.securityDeposit > 1000 ? selectedReq.securityDeposit / 100 : selectedReq.securityDeposit) : 0);
        const sDocs = Array.isArray(selectedReq.documents) ? selectedReq.documents : [];

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Solicitud de Arrendamiento</span>
                  <h2 className="text-2xl font-black text-luxem-night font-mono">{sCode}</h2>
                </div>
                <button
                  onClick={() => setSelectedReq(null)}
                  className="p-2 text-gray-400 hover:text-luxem-night rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Sub-Tabs */}
              <div className="flex gap-2 border-b pb-3">
                <button
                  onClick={() => setActiveTab('DETAILS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'DETAILS' ? 'bg-luxem-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Información y Documentos
                </button>
                {selectedReq.status !== 'APROBADA' && selectedReq.status !== 'RECHAZADA' && (
                  <>
                    <button
                      onClick={() => setActiveTab('APPROVE')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        activeTab === 'APPROVE' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-emerald-700'
                      }`}
                    >
                      Aprobar Solicitud
                    </button>
                    <button
                      onClick={() => setActiveTab('REQUEST_INFO')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        activeTab === 'REQUEST_INFO' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-amber-700'
                      }`}
                    >
                      Pedir Documentos
                    </button>
                    <button
                      onClick={() => setActiveTab('REJECT')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        activeTab === 'REJECT' ? 'bg-red-600 text-white' : 'bg-gray-100 text-red-700'
                      }`}
                    >
                      Rechazar
                    </button>
                  </>
                )}
              </div>

              {/* TAB 1: DETAILS & DOCUMENTS */}
              {activeTab === 'DETAILS' && (
                <div className="space-y-6">
                  {/* Client & Itinerary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-2xl text-xs">
                    <div>
                      <h4 className="font-bold text-luxem-night uppercase tracking-wider mb-2 text-[10px]">
                        Datos del Solicitante
                      </h4>
                      <div className="space-y-1 text-gray-700">
                        <div><strong>Nombre:</strong> {sCustName}</div>
                        <div><strong>DUI / Doc:</strong> {sCustDoc}</div>
                        <div><strong>Email:</strong> {sEmail}</div>
                        <div><strong>Teléfono:</strong> {sPhone}</div>
                        <div><strong>Dirección:</strong> {sAddress}</div>
                        <div><strong>Contacto Emergencia:</strong> {sEmergName} {sEmergPhone ? `(${sEmergPhone})` : ''}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-luxem-night uppercase tracking-wider mb-2 text-[10px]">
                        Itinerario y Costos
                      </h4>
                      <div className="space-y-1 text-gray-700">
                        <div><strong>Vehículo Solicitado:</strong> {sVBrand} {sVModel}</div>
                        <div><strong>Entrega:</strong> {sPDate ? new Date(sPDate).toLocaleString('es-SV') : 'N/D'} ({sPLoc})</div>
                        <div><strong>Devolución:</strong> {sRDate ? new Date(sRDate).toLocaleString('es-SV') : 'N/D'} ({sRLoc})</div>
                        <div><strong>Total Estimado:</strong> ${sTotal.toFixed(2)}</div>
                        <div><strong>Depósito Reembolsable:</strong> ${sDeposit.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Document Gallery */}
                  <div>
                    <h4 className="font-bold text-sm text-luxem-night mb-3">
                      Documentos de Identidad Adjuntos
                    </h4>
                    {sDocs.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 text-center">
                        No se han adjuntado archivos todavía
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-4 rounded-2xl border border-gray-200 bg-white flex items-center justify-between shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-6 h-6 text-luxem-primary" />
                              <div>
                                <div className="text-xs font-bold text-luxem-night">
                                  {doc.documentType.replace('_', ' ')}
                                </div>
                                <div className="text-[10px] text-gray-400">{doc.filename || doc.file?.originalName || 'documento'}</div>
                              </div>
                            </div>

                            <a
                              href={`/api/requests/${selectedReq.id}/documents/${doc.id}/view`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-100 hover:bg-luxem-primary hover:text-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Ver
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: APPROVE */}
              {activeTab === 'APPROVE' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 text-xs">
                    Al aprobar esta solicitud, se generará formalmente la <strong>Reserva</strong> en el sistema, se bloquearán las fechas del vehículo para evitar doble reserva y se notificará al cliente por correo electrónico con su token de confirmación.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                      Vehículo a Asignar
                    </label>
                    <select
                      value={approveVehicleId}
                      onChange={(e) => setApproveVehicleId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold bg-white"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.model || v.name} ({v.plate || v.licensePlate || 'S/P'})
                        </option>
                      ))}
                    </select>
                  </div>

                <div>
                  <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                    Notas Internas / Instrucciones
                  </label>
                  <textarea
                    rows={3}
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    placeholder="Instrucciones para el chofer o notas del cliente..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirmar Aprobación y Bloquear Unidad
                </button>
              </div>
            )}

            {/* TAB 3: REQUEST INFO */}
            {activeTab === 'REQUEST_INFO' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 text-amber-900 text-xs">
                  Se notificará al cliente por correo indicándole qué documentos necesita corregir (ej: foto borrosa, licencia vencida o falta reverso). El cliente podrá re-subirlos directamente en su enlace de seguimiento.
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                    Detalle de Documentos o Corrección Solicitada *
                  </label>
                  <textarea
                    rows={4}
                    value={requestInfoNotes}
                    onChange={(e) => setRequestInfoNotes(e.target.value)}
                    placeholder="Ej: Estimado cliente, la fotografía de su licencia de conducir no es legible. Por favor suba una foto nítida..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                </div>

                <button
                  onClick={handleRequestInfo}
                  disabled={actionLoading}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  Notificar al Cliente para Reenvío
                </button>
              </div>
            )}

            {/* TAB 4: REJECT */}
            {activeTab === 'REJECT' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-red-50 text-red-900 text-xs">
                  Rechazar la solicitud liberará cualquier previsión y enviará una notificación formal al solicitante.
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                    Motivo del Rechazo *
                  </label>
                  <textarea
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ej: Documentación no cumple con la política de edad mínima requerida o historial no asegurable..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                </div>

                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Rechazar Solicitud Definitivamente
                </button>
              </div>
            )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
