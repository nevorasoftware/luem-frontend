'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building, Phone, DollarSign, Loader2, CheckCircle2, AlertCircle, Save 
} from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Business Parameters
  const [businessName, setBusinessName] = useState('LUEM RENT A CAR');
  const [taxId, setTaxId] = useState('0614-010190-101-1');
  const [email, setEmail] = useState('reservas@luemrentacar.com');
  const [phone, setPhone] = useState('+503 2200-1122');
  const [whatsapp, setWhatsapp] = useState('+503 7000-0000');
  const [address, setAddress] = useState('Colonia Escalón, Paseo General Escalón #4500, San Salvador');
  const [ivaRate, setIvaRate] = useState('13');
  const [defaultSecurityDeposit, setDefaultSecurityDeposit] = useState('400');

  useEffect(() => {
    fetchSettings();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    if (type === 'success') {
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      let res = await fetch('/api/settings/admin', { headers: getAuthHeaders() });
      if (!res.ok) {
        res = await fetch('/api/settings/public');
      }
      if (res.ok) {
        const data = await res.json();
        const bInfo = data.business_info || {};
        const rPolicy = data.rental_policy || {};
        const fInfo = data.fiscal_info || {};

        if (data.businessName || bInfo.companyName) {
          setBusinessName(data.businessName || bInfo.companyName);
        }
        if (data.taxId || bInfo.taxId || fInfo.taxId) {
          setTaxId(data.taxId || bInfo.taxId || fInfo.taxId);
        }
        if (data.email || bInfo.email) {
          setEmail(data.email || bInfo.email);
        }
        if (data.phone || bInfo.phone) {
          setPhone(data.phone || bInfo.phone);
        }
        if (data.whatsapp || bInfo.whatsapp) {
          setWhatsapp(data.whatsapp || bInfo.whatsapp);
        }
        if (data.address || bInfo.address) {
          setAddress(data.address || bInfo.address);
        }
        if (data.ivaRate !== undefined || fInfo.ivaRate !== undefined) {
          setIvaRate(String(data.ivaRate ?? fInfo.ivaRate ?? 13));
        }

        const deposit = data.defaultSecurityDeposit ?? data.depositAmount ?? rPolicy.depositAmount;
        if (deposit !== undefined) {
          const num = Number(deposit);
          setDefaultSecurityDeposit(String(num > 1000 ? num / 100 : num));
        }
      }
    } catch (e) {
      console.error(e);
      showFeedback('error', 'Error al cargar configuración actual');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const depositVal = parseFloat(defaultSecurityDeposit);
      if (isNaN(depositVal) || depositVal < 0) {
        throw new Error('El monto del depósito en garantía debe ser un número válido mayor o igual a 0');
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          businessName: businessName.trim(),
          taxId: taxId.trim(),
          email: email.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          address: address.trim(),
          ivaRate: parseFloat(ivaRate) || 13,
          defaultSecurityDeposit: depositVal,
          depositAmount: depositVal,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar configuración en el servidor');
      }

      showFeedback('success', '¡Parámetros comerciales y depósito de garantía actualizados correctamente!');
    } catch (err: any) {
      showFeedback('error', err.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 text-luxem-accent animate-spin mx-auto mb-2" />
        <p className="text-xs text-luxem-night/60">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-luxem-night">Parámetros del Sistema</h1>
        <p className="text-xs text-luxem-night/60 mt-1">
          Información legal de la empresa, contacto público y reglas fiscales de El Salvador
        </p>
      </div>

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

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6 text-xs">
        {/* Company Section */}
        <div>
          <h2 className="text-sm font-bold text-luxem-night uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-luxem-accent" />
            Identidad Corporativa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Razón Social / Nombre Comercial *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">NIT / NRC *</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t pt-6">
          <h2 className="text-sm font-bold text-luxem-night uppercase tracking-wider mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-luxem-accent" />
            Canales de Atención al Cliente
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Correo Notificaciones *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Teléfono Fijo Oficina *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">WhatsApp Soporte 24/7 *</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
            </div>
            <div className="sm:col-span-3">
              <label className="font-bold text-gray-700 block mb-1">Dirección Central en El Salvador</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Financial Rules */}
        <div className="border-t pt-6">
          <h2 className="text-sm font-bold text-luxem-night uppercase tracking-wider mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-luxem-accent" />
            Reglas Comerciales e Impuestos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Tasa de IVA en El Salvador (%)</label>
              <input
                type="number"
                step="0.01"
                value={ivaRate}
                onChange={(e) => setIvaRate(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
              <span className="text-[10px] text-gray-400">13% establecido por ley.</span>
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Depósito Base en Garantía (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={defaultSecurityDeposit}
                onChange={(e) => setDefaultSecurityDeposit(e.target.value)}
                placeholder="400"
                className="w-full px-3 py-2 border rounded-xl font-bold text-luxem-primary"
                required
              />
              <span className="text-[10px] text-gray-400">
                Monto base de garantía que se aplica a los contratos y cotizaciones.
              </span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-luxem-primary hover:bg-luxem-accent disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-md"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando configuración...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
