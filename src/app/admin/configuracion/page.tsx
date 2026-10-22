'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Building, Mail, Phone, MapPin, DollarSign, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Business Parameters
  const [businessName, setBusinessName] = useState('LUXEM RENT A CAR');
  const [taxId, setTaxId] = useState('0614-010190-101-1');
  const [email, setEmail] = useState('reservas@luxemrentacar.com');
  const [phone, setPhone] = useState('+503 2200-1122');
  const [whatsapp, setWhatsapp] = useState('+503 7000-0000');
  const [address, setAddress] = useState('Colonia Escalón, Paseo General Escalón #4500, San Salvador');
  const [ivaRate, setIvaRate] = useState('13');
  const [defaultSecurityDeposit, setDefaultSecurityDeposit] = useState('400');

  useEffect(() => {
    fetch('/api/settings/public')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.businessName) setBusinessName(data.businessName);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.whatsapp) setWhatsapp(data.whatsapp);
        if (data.address) setAddress(data.address);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          taxId,
          email,
          phone,
          whatsapp,
          address,
          ivaRate: parseFloat(ivaRate),
          defaultSecurityDeposit: parseFloat(defaultSecurityDeposit) * 100,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar configuración');
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
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

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ¡Parámetros comerciales actualizados correctamente!
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
                value={ivaRate}
                onChange={(e) => setIvaRate(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
              <span className="text-[10px] text-gray-400">13% establecido por ley.</span>
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Depósito Base en Garantía (USD)</label>
              <input
                type="number"
                value={defaultSecurityDeposit}
                onChange={(e) => setDefaultSecurityDeposit(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
                required
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-luxem-primary hover:bg-luxem-accent text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-md"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
}
