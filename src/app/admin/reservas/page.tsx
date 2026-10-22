'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Search, DollarSign, ClipboardCheck, 
  Car, User, Clock, Loader2, CheckCircle2, AlertCircle, X, PlusCircle 
} from 'lucide-react';

interface ReservationItem {
  id: string;
  code?: string;
  reservationCode?: string;
  status: string;
  pickupAt?: string;
  returnAt?: string;
  pickupDate?: string;
  returnDate?: string;
  pickupLocation?: string | { name: string };
  returnLocation?: string | { name: string };
  total?: number;
  totalAmount?: number;
  amountPaid?: number;
  paidAmount?: number;
  balanceDue?: number;
  securityDeposit?: number;
  depositRequired?: number;
  customer?: {
    fullName?: string;
    dui?: string;
    documentNumber?: string;
    phone?: string;
    email?: string;
  };
  vehicle?: {
    name?: string;
    model?: string;
    brand?: string;
    plate?: string;
    licensePlate?: string;
  };
  payments?: {
    id: string;
    amount: number;
    method: string;
    status: string;
    reference?: string;
    createdAt: string;
  }[];
  inspections?: {
    id: string;
    inspectionType: string;
    fuelLevel: string;
    odometerKm: number;
    notes?: string;
    createdAt: string;
  }[];
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODAS');

  // Modals
  const [selectedRes, setSelectedRes] = useState<ReservationItem | null>(null);
  const [modalTab, setModalTab] = useState<'DETAILS' | 'PAYMENT' | 'INSPECTION'>('DETAILS');

  // Payment form
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('TRANSFERENCIA');
  const [payRef, setPayRef] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Inspection form
  const [inspType, setInspType] = useState('ENTREGA');
  const [fuelLevel, setFuelLevel] = useState('LLENO');
  const [odometerKm, setOdometerKm] = useState('');
  const [inspNotes, setInspNotes] = useState('');

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const data = await res.json();
        setReservations(Array.isArray(data) ? data : data.reservations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes || !payAmount) return;

    setActionLoading(true);
    try {
      const amountCents = Math.round(parseFloat(payAmount) * 100);
      const res = await fetch(`/api/reservations/${selectedRes.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountCents,
          method: payMethod,
          reference: payRef,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al registrar pago');
      }

      alert('Pago registrado correctamente');
      setPayAmount('');
      setPayRef('');
      setSelectedRes(null);
      loadReservations();
    } catch (err: any) {
      alert(err.message || 'Error al procesar pago');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes || !odometerKm) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/reservations/${selectedRes.id}/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionType: inspType,
          fuelLevel,
          odometerKm: parseInt(odometerKm, 10),
          notes: inspNotes,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al registrar acta de inspección');
      }

      alert('Acta de inspección registrada exitosamente');
      setOdometerKm('');
      setInspNotes('');
      setSelectedRes(null);
      loadReservations();
    } catch (err: any) {
      alert(err.message || 'Error al registrar inspección');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'TODAS' || r.status === statusFilter;
    if (!search.trim()) return matchesStatus;
    const q = search.trim().toLowerCase();
    const code = (r.code || r.reservationCode || '').toLowerCase();
    const customer = (r.customer?.fullName || '').toLowerCase();
    const dui = (r.customer?.dui || r.customer?.documentNumber || '').toLowerCase();
    const plate = (r.vehicle?.plate || r.vehicle?.licensePlate || '').toLowerCase();
    const model = (r.vehicle?.model || r.vehicle?.name || '').toLowerCase();
    const matchesSearch =
      code.includes(q) ||
      customer.includes(q) ||
      dui.includes(q) ||
      plate.includes(q) ||
      model.includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-luxem-night">Gestión de Reservas</h1>
        <p className="text-xs text-luxem-night/60 mt-1">
          Control de pagos, entrega y devolución con actas de inspección digital
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por código, cliente o placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['TODAS', 'CONFIRMADA', 'EN_CURSO', 'FINALIZADA', 'COMPLETADA', 'CANCELADA'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                statusFilter === st
                  ? 'bg-luxem-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-luxem-accent animate-spin mx-auto mb-2" />
            <p className="text-xs text-luxem-night/60">Cargando reservas...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm font-bold text-luxem-night">
            No se encontraron reservas registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-luxem-night/60 border-b border-gray-100 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Vehículo / Placa</th>
                  <th className="py-3.5 px-4">Fechas</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Pagado</th>
                  <th className="py-3.5 px-4">Saldo</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((res) => {
                  const resCode = res.code || res.reservationCode || 'RES';
                  const custName = res.customer?.fullName || 'Cliente General';
                  const custPhone = res.customer?.phone || 'Sin teléfono';
                  const vBrand = res.vehicle?.brand || '';
                  const vModel = res.vehicle?.model || res.vehicle?.name || 'Vehículo';
                  const vPlate = res.vehicle?.plate || res.vehicle?.licensePlate || 'S/P';
                  const pDate = res.pickupAt || res.pickupDate;
                  const rDate = res.returnAt || res.returnDate;
                  const total = Number(res.total ?? (res.totalAmount ? (res.totalAmount > 1000 ? res.totalAmount / 100 : res.totalAmount) : 0));
                  const paid = Number(res.amountPaid ?? (res.paidAmount ? (res.paidAmount > 1000 ? res.paidAmount / 100 : res.paidAmount) : 0));
                  const balance = Number(res.balanceDue !== undefined ? (res.balanceDue > 1000 ? res.balanceDue / 100 : res.balanceDue) : Math.max(0, total - paid));

                  return (
                    <tr key={res.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-luxem-primary">
                        {resCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-luxem-night">{custName}</div>
                        <div className="text-[11px] text-gray-400">{custPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-luxem-night">
                          {vBrand} {vModel}
                        </div>
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-700">
                          {vPlate}
                        </span>
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
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">
                        ${paid.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-amber-600 font-bold">
                        ${balance.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            res.status === 'EN_CURSO'
                              ? 'bg-blue-100 text-blue-800'
                              : res.status === 'CONFIRMADA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : res.status === 'FINALIZADA' || res.status === 'COMPLETADA'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRes(res);
                            setModalTab('DETAILS');
                          }}
                          className="bg-luxem-primary hover:bg-luxem-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          Gestionar
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

      {/* Detail / Action Modal */}
      {selectedRes && (() => {
        const mCode = selectedRes.code || selectedRes.reservationCode || 'RES';
        const mCustName = selectedRes.customer?.fullName || 'Cliente General';
        const mCustDoc = selectedRes.customer?.dui || selectedRes.customer?.documentNumber || 'S/D';
        const mCustPhone = selectedRes.customer?.phone || 'Sin teléfono';
        const mVBrand = selectedRes.vehicle?.brand || '';
        const mVModel = selectedRes.vehicle?.model || selectedRes.vehicle?.name || 'Vehículo';
        const mVPlate = selectedRes.vehicle?.plate || selectedRes.vehicle?.licensePlate || 'S/P';
        const mTotal = Number(selectedRes.total ?? (selectedRes.totalAmount ? (selectedRes.totalAmount > 1000 ? selectedRes.totalAmount / 100 : selectedRes.totalAmount) : 0));
        const mPaid = Number(selectedRes.amountPaid ?? (selectedRes.paidAmount ? (selectedRes.paidAmount > 1000 ? selectedRes.paidAmount / 100 : selectedRes.paidAmount) : 0));
        const mBalance = Number(selectedRes.balanceDue !== undefined ? (selectedRes.balanceDue > 1000 ? selectedRes.balanceDue / 100 : selectedRes.balanceDue) : Math.max(0, mTotal - mPaid));

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Reserva Vehicular</span>
                  <h2 className="text-2xl font-black text-luxem-night font-mono">{mCode}</h2>
                </div>
                <button onClick={() => setSelectedRes(null)} className="p-2 text-gray-400 hover:text-luxem-night">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex gap-2 border-b pb-3">
                <button
                  onClick={() => setModalTab('DETAILS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    modalTab === 'DETAILS' ? 'bg-luxem-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Detalles
                </button>
                <button
                  onClick={() => setModalTab('PAYMENT')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    modalTab === 'PAYMENT' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-emerald-700'
                  }`}
                >
                  + Registrar Pago
                </button>
                <button
                  onClick={() => setModalTab('INSPECTION')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    modalTab === 'INSPECTION' ? 'bg-luxem-night text-white' : 'bg-gray-100 text-luxem-night'
                  }`}
                >
                  + Inspección (Entrega / Devolución)
                </button>
              </div>

              {/* TAB DETAILS */}
              {modalTab === 'DETAILS' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl">
                    <div>
                      <strong className="block text-gray-500 uppercase text-[10px] mb-1">Cliente</strong>
                      <div className="font-bold text-sm text-luxem-night">{mCustName}</div>
                      <div>DUI: {mCustDoc}</div>
                      <div>Tel: {mCustPhone}</div>
                    </div>
                    <div>
                      <strong className="block text-gray-500 uppercase text-[10px] mb-1">Vehículo Asignado</strong>
                      <div className="font-bold text-sm text-luxem-night">
                        {mVBrand} {mVModel}
                      </div>
                      <div>Placa: {mVPlate}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-gray-50 rounded-xl border">
                      <span className="text-gray-500 text-[10px] block">Total</span>
                      <strong className="text-sm font-black text-luxem-night">
                        ${mTotal.toFixed(2)}
                      </strong>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-emerald-700 text-[10px] block">Abonado</span>
                      <strong className="text-sm font-black text-emerald-800">
                        ${mPaid.toFixed(2)}
                      </strong>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="text-amber-700 text-[10px] block">Saldo Pendiente</span>
                      <strong className="text-sm font-black text-amber-800">
                        ${mBalance.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

            {/* TAB PAYMENT */}
            {modalTab === 'PAYMENT' && (
              <form onSubmit={handleRegisterPayment} className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900">
                  Saldo pendiente por cobrar: <strong>${mBalance.toFixed(2)} USD</strong>
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                    Monto a Registrar (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Ej: 150.00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                    Método de Pago
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="TRANSFERENCIA">Transferencia Bancaria (Agrícola / BAC)</option>
                    <option value="TARJETA_CREDITO">Tarjeta de Crédito / Débito (Wompi)</option>
                    <option value="EFECTIVO">Efectivo en Sucursal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                    Referencia de Transacción o Recibo
                  </label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="Ej: Comprobante No. 8923481"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs transition"
                >
                  {actionLoading ? 'Procesando...' : 'Guardar Abono / Pago'}
                </button>
              </form>
            )}

            {/* TAB INSPECTION */}
            {modalTab === 'INSPECTION' && (
              <form onSubmit={handleRegisterInspection} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                      Tipo de Acta
                    </label>
                    <select
                      value={inspType}
                      onChange={(e) => setInspType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs bg-white"
                    >
                      <option value="ENTREGA">Acta de Entrega (Check-out)</option>
                      <option value="DEVOLUCION">Acta de Devolución (Check-in)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                      Nivel de Combustible
                    </label>
                    <select
                      value={fuelLevel}
                      onChange={(e) => setFuelLevel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs bg-white"
                    >
                      <option value="LLENO">Tanque Lleno (100%)</option>
                      <option value="TRES_CUARTOS">3/4 de Tanque</option>
                      <option value="MEDIO">Medio Tanque (50%)</option>
                      <option value="UN_CUARTO">1/4 de Tanque</option>
                      <option value="RESERVA">Reserva</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                    Kilometraje de Odómetro (KM) *
                  </label>
                  <input
                    type="number"
                    value={odometerKm}
                    onChange={(e) => setOdometerKm(e.target.value)}
                    placeholder="Ej: 34500"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                    Observaciones / Rayones / Daños existentes
                  </label>
                  <textarea
                    rows={3}
                    value={inspNotes}
                    onChange={(e) => setInspNotes(e.target.value)}
                    placeholder="Detalle de rayones, estado de llantas, herramientas o rueda de repuesto..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-luxem-night hover:bg-luxem-primary disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs transition"
                >
                  {actionLoading ? 'Guardando Acta...' : 'Firmar y Guardar Inspección'}
                </button>
              </form>
            )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
