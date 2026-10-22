'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldAlert, ShieldCheck, Phone, Mail, Loader2 } from 'lucide-react';

interface CustomerAdmin {
  id: string;
  fullName: string;
  documentNumber: string;
  documentType: string;
  email: string;
  phone: string;
  isBlocked: boolean;
  blockReason?: string;
  createdAt: string;
  _count?: {
    reservations: number;
    bookingRequests: number;
  };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(Array.isArray(data) ? data : data.customers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (customer: CustomerAdmin) => {
    const action = customer.isBlocked ? 'desbloquear' : 'bloquear';
    const reason = !customer.isBlocked ? prompt('Ingresa el motivo del bloqueo:') : '';
    if (!customer.isBlocked && !reason) return;

    try {
      const res = await fetch(`/api/customers/${customer.id}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !customer.isBlocked, blockReason: reason }),
      });
      if (res.ok) {
        loadCustomers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-luxem-night">Directorio de Clientes</h1>
        <p className="text-xs text-luxem-night/60 mt-1">
          Historial de alquileres, verificación de identidad y control de riesgo
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, DUI o correo..."
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
            <p className="text-xs text-luxem-night/60">Cargando clientes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm font-bold text-luxem-night">
            No se encontraron clientes registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-luxem-night/60 border-b border-gray-100 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Documento / DUI</th>
                  <th className="py-3.5 px-4">Contacto</th>
                  <th className="py-3.5 px-4">Reservas</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-luxem-night">{c.fullName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-luxem-primary">
                      {c.documentNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-gray-400">{c.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold">{c._count?.reservations || 0} contratos</td>
                    <td className="py-3.5 px-4">
                      {c.isBlocked ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          Bloqueado
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Habilitado
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleBlock(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          c.isBlocked
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            : 'bg-red-50 hover:bg-red-100 text-red-700'
                        }`}
                      >
                        {c.isBlocked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
