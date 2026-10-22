'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, XCircle, 
  Upload, FileText, ArrowRight, Loader2, Phone, Mail, Car, Calendar, MapPin, DollarSign 
} from 'lucide-react';

interface RequestEvent {
  id: string;
  eventType: string;
  fromStatus?: string;
  toStatus?: string;
  message: string;
  createdAt: string;
}

interface RequestDocument {
  id: string;
  documentType: string;
  status: string;
  rejectionReason?: string;
  filename: string;
}

interface TrackData {
  id: string;
  requestCode: string;
  status: string;
  reviewNotes?: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  totalAmount: number;
  securityDeposit: number;
  vehicle: {
    name: string;
    brand: string;
    model: string;
    year: number;
  };
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  documents: RequestDocument[];
  events: RequestEvent[];
  reservation?: {
    reservationCode: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
  };
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [inputToken, setInputToken] = useState(tokenParam);
  const [activeToken, setActiveToken] = useState(tokenParam);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File upload state for incomplete docs
  const [reuploadDocType, setReuploadDocType] = useState<string>('DUI_FRENTE');
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (activeToken) {
      fetchTracking(activeToken);
    }
  }, [activeToken]);

  const fetchTracking = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/track?token=${encodeURIComponent(token.trim())}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Token inválido o solicitud no encontrada.');
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Error al consultar la solicitud.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.trim()) {
      setActiveToken(inputToken.trim());
    }
  };

  const handleReupload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reuploadFile || !activeToken) return;

    setUploading(true);
    setUploadSuccess(false);

    try {
      const fd = new FormData();
      fd.append('token', activeToken);
      fd.append('documentType', reuploadDocType);
      fd.append('file', reuploadFile);

      const res = await fetch('/api/requests/track/documents', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al subir el nuevo documento');
      }

      setUploadSuccess(true);
      setReuploadFile(null);
      // Reload tracking data
      fetchTracking(activeToken);
    } catch (err: any) {
      alert(err.message || 'Error al cargar documento');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APROBADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Solicitud Aprobada
          </span>
        );
      case 'PENDIENTE_REVISION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 text-blue-600" /> En Revisión de Documentos
          </span>
        );
      case 'DOCUMENTACION_INCOMPLETA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Documentación Incompleta
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 text-red-600" /> Solicitud Rechazada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-luxem-bg py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Token Search Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-7 h-7 text-luxem-accent" />
            <div>
              <h1 className="text-2xl font-bold text-luxem-night">Seguimiento Seguro de Solicitud</h1>
              <p className="text-xs text-luxem-night/60">
                Consulta el estado de tu trámite utilizando tu token único de acceso
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Pega aquí tu token de seguimiento (ej: f49a8e0...)"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm font-mono"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-luxem-primary hover:bg-luxem-accent text-white px-8 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Consultar'}
            </button>
          </form>
        </div>

        {error && (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm mb-8 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <div className="font-bold">No pudimos encontrar la solicitud</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Loaded Data View */}
        {data && (
          <div className="space-y-8">
            {/* Main Status Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                <div>
                  <span className="text-xs font-bold text-luxem-night/50 uppercase tracking-wider">
                    Código de Solicitud
                  </span>
                  <div className="text-3xl font-black text-luxem-night tracking-tight font-mono">
                    {data.requestCode}
                  </div>
                </div>
                <div>{getStatusBadge(data.status)}</div>
              </div>

              {/* Status Specific Banners */}
              {data.status === 'APROBADA' && (
                <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ¡Tu solicitud ha sido aprobada exitosamente!
                  </div>
                  <p className="text-sm text-emerald-800">
                    Tu vehículo está reservado. Para garantizar tu entrega, por favor procede con el anticipo según las instrucciones a continuación o comunícate vía WhatsApp.
                  </p>
                  {data.reservation && (
                    <div className="bg-white/80 rounded-xl p-4 text-xs font-mono text-emerald-950 flex flex-wrap justify-between gap-4">
                      <div>
                        <span className="text-emerald-700 block">Código de Reserva:</span>
                        <strong className="text-sm">{data.reservation.reservationCode}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-700 block">Total a Pagar:</span>
                        <strong className="text-sm">${(data.reservation.totalAmount / 100).toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-700 block">Saldo Pendiente:</span>
                        <strong className="text-sm">${(data.reservation.balanceDue / 100).toFixed(2)}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {data.status === 'DOCUMENTACION_INCOMPLETA' && (
                <div className="mt-6 p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                    Se requiere actualización o corrección de documentos
                  </div>
                  <p className="text-sm text-amber-800">
                    {data.reviewNotes || 'Por favor sube nuevamente los documentos indicados para continuar con la validación de tu reserva.'}
                  </p>
                </div>
              )}

              {data.status === 'PENDIENTE_REVISION' && (
                <div className="mt-6 p-6 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                  <p className="text-sm text-blue-800">
                    Nuestro equipo está verificando tu identidad y la disponibilidad en el sistema. Te notificaremos a <strong>{data.customer.email}</strong> y al teléfono <strong>{data.customer.phone}</strong>.
                  </p>
                </div>
              )}

              {/* Itinerary & Vehicle Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                <div>
                  <h4 className="text-xs font-bold text-luxem-night/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-luxem-accent" />
                    Vehículo
                  </h4>
                  <div className="font-bold text-lg text-luxem-night">
                    {data.vehicle.brand} {data.vehicle.name} ({data.vehicle.year})
                  </div>
                  <div className="text-xs text-luxem-night/70">{data.vehicle.model}</div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-luxem-night/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-luxem-accent" />
                    Fechas y Lugares
                  </h4>
                  <div className="text-xs space-y-1 text-luxem-night/80">
                    <div>
                      <strong>Entrega:</strong> {new Date(data.pickupDate).toLocaleString('es-SV')} ({data.pickupLocation})
                    </div>
                    <div>
                      <strong>Devolución:</strong> {new Date(data.returnDate).toLocaleString('es-SV')} ({data.returnLocation})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Reupload Box if Incomplete */}
            {data.status === 'DOCUMENTACION_INCOMPLETA' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-200">
                <h3 className="text-lg font-bold text-luxem-night mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-600" />
                  Cargar Documento Actualizado
                </h3>

                {uploadSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ¡Documento actualizado correctamente! Nuestro equipo lo revisará a la brevedad.
                  </div>
                )}

                <form onSubmit={handleReupload} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Tipo de Documento a Actualizar
                      </label>
                      <select
                        value={reuploadDocType}
                        onChange={(e) => setReuploadDocType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-white"
                      >
                        <option value="DUI_FRENTE">DUI / Pasaporte (Frente)</option>
                        <option value="DUI_REVERSO">DUI (Reverso)</option>
                        <option value="LICENCIA_FRENTE">Licencia de Conducir (Frente)</option>
                        <option value="LICENCIA_REVERSO">Licencia de Conducir (Reverso)</option>
                        <option value="COMPROBANTE_DOMICILIO">Comprobante de Domicilio (Recibo)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Archivo (JPG, PNG o PDF)
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setReuploadFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-500 file:mr-2 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-luxem-primary file:text-white hover:file:bg-luxem-accent cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !reuploadFile}
                    className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Enviar Documento Corregido
                  </button>
                </form>
              </div>
            )}

            {/* Document Checklist */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-luxem-night mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-luxem-accent" />
                Estado de Documentos Adjuntos
              </h3>
              <div className="space-y-3">
                {data.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-luxem-primary" />
                      <div>
                        <div className="text-sm font-bold text-luxem-night">
                          {doc.documentType.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-luxem-night/50">{doc.filename}</div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        doc.status === 'APROBADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'RECHAZADO'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-luxem-night mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-luxem-accent" />
                Historial de Actividad
              </h3>
              <div className="space-y-4">
                {data.events.map((evt, idx) => (
                  <div key={evt.id || idx} className="flex items-start gap-3 border-l-2 border-luxem-primary/20 pl-4 py-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-luxem-primary -ml-[21px] mt-1.5 ring-4 ring-white" />
                    <div>
                      <div className="text-xs font-bold text-luxem-night">{evt.message}</div>
                      <div className="text-[11px] text-luxem-night/50">
                        {new Date(evt.createdAt).toLocaleString('es-SV')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assistance Card */}
            <div className="bg-luxem-night text-white rounded-3xl p-8 text-center space-y-4">
              <h3 className="text-xl font-bold">¿Tienes dudas sobre tu solicitud?</h3>
              <p className="text-luxem-silver text-sm max-w-lg mx-auto">
                Nuestro equipo de atención al cliente está disponible 24/7 en El Salvador para asistirte en todo momento.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <a
                  href="https://wa.me/50370000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 text-sm shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp Soporte
                </a>
                <a
                  href="mailto:soporte@luxemrentacar.com"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  soporte@luxemrentacar.com
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-luxem-bg py-24">
        <Loader2 className="w-12 h-12 text-luxem-accent animate-spin mx-auto" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
