'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Car, Calendar, MapPin, Upload, CheckCircle2, AlertCircle, FileText, 
  ShieldCheck, ArrowRight, ArrowLeft, Loader2, Info, User, Phone, Mail, CreditCard 
} from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  slug: string;
  dailyPrice: number;
  securityDeposit: number;
  category: { name: string };
  coverImageUrl?: string;
}

interface Extra {
  id: string;
  code: string;
  name: string;
  pricePerDay: number;
  flatFee: number;
  description?: string;
}

interface QuoteResponse {
  rentalDays: number;
  dailyRate: number;
  daysSubtotal: number;
  volumeDiscountAmount: number;
  promoDiscountAmount: number;
  extrasTotal: number;
  locationFee: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  securityDeposit: number;
}

const LOCATIONS = [
  { id: 'SAL_AEROPUERTO', name: 'Aeropuerto Int. San Óscar Arnulfo Romero (SAL)' },
  { id: 'SAN_SALVADOR', name: 'Oficina Central San Salvador (Col. Escalón)' },
  { id: 'SANTA_ANA', name: 'Sucursal Santa Ana (Metrocentro)' },
  { id: 'SAN_MIGUEL', name: 'Sucursal San Miguel (Av. Roosevelt)' },
];

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form state
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('10:00');
  const [returnDate, setReturnDate] = useState<string>('');
  const [returnTime, setReturnTime] = useState<string>('10:00');
  const [pickupLocation, setPickupLocation] = useState<string>('SAL_AEROPUERTO');
  const [returnLocation, setReturnLocation] = useState<string>('SAL_AEROPUERTO');
  const [flightNumber, setFlightNumber] = useState<string>('');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  // Personal Info
  const [fullName, setFullName] = useState<string>('');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState<string>('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [emergencyContactName, setEmergencyContactName] = useState<string>('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  // Documents
  const [duiFront, setDuiFront] = useState<File | null>(null);
  const [duiBack, setDuiBack] = useState<File | null>(null);
  const [licenseFront, setLicenseFront] = useState<File | null>(null);
  const [utilityBill, setUtilityBill] = useState<File | null>(null);

  // Quote State
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    requestCode: string;
    accessToken: string;
  } | null>(null);

  // Prepopulate from URL params
  useEffect(() => {
    async function loadData() {
      try {
        const [vehRes, extRes] = await Promise.all([
          fetch('/api/fleet/vehicles').then((r) => r.json()).catch(() => []),
          fetch('/api/fleet/extras').then((r) => r.json()).catch(() => []),
        ]);

        const vehList: Vehicle[] = Array.isArray(vehRes) ? vehRes : vehRes.vehicles || [];
        setVehicles(vehList);

        const extList: Extra[] = Array.isArray(extRes) ? extRes : extRes.extras || [];
        setExtras(extList);

        const initialSlug = searchParams.get('vehiculo');
        if (initialSlug && vehList.length > 0) {
          const match = vehList.find((v) => v.slug === initialSlug || v.id === initialSlug);
          if (match) setSelectedVehicleId(match.id);
        } else if (vehList.length > 0) {
          setSelectedVehicleId(vehList[0].id);
        }

        const paramPickup = searchParams.get('pickup');
        const paramReturn = searchParams.get('return');
        if (paramPickup) setPickupDate(paramPickup);
        if (paramReturn) setReturnDate(paramReturn);

        if (!paramPickup) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setPickupDate(tomorrow.toISOString().split('T')[0]);

          const end = new Date();
          end.setDate(end.getDate() + 4);
          setReturnDate(end.toISOString().split('T')[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, [searchParams]);

  // Recalculate Quote
  useEffect(() => {
    if (!selectedVehicleId || !pickupDate || !returnDate) return;

    async function fetchQuote() {
      setLoadingQuote(true);
      try {
        const pickupStr = `${pickupDate}T${pickupTime}:00`;
        const returnStr = `${returnDate}T${returnTime}:00`;

        const res = await fetch('/api/fleet/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: selectedVehicleId,
            pickupDate: pickupStr,
            returnDate: returnStr,
            pickupLocation,
            returnLocation,
            extraIds: selectedExtras,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setQuote(data);
        }
      } catch (err) {
        console.error('Error fetching quote', err);
      } finally {
        setLoadingQuote(false);
      }
    }

    fetchQuote();
  }, [selectedVehicleId, pickupDate, pickupTime, returnDate, returnTime, pickupLocation, returnLocation, selectedExtras]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const handleExtraToggle = (id: string) => {
    if (selectedExtras.includes(id)) {
      setSelectedExtras(selectedExtras.filter((e) => e !== id));
    } else {
      setSelectedExtras([...selectedExtras, id]);
    }
  };

  const handleNextStep = () => {
    setSubmitError(null);
    if (step === 1) {
      if (!selectedVehicleId || !pickupDate || !returnDate) {
        setSubmitError('Por favor selecciona el vehículo y el rango de fechas.');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      if (!fullName || !documentNumber || !email || !phone || !driverLicenseNumber || !licenseExpiryDate) {
        setSubmitError('Por favor completa todos los campos personales obligatorios.');
        return;
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!duiFront || !duiBack || !licenseFront || !utilityBill) {
      setSubmitError('Debes adjuntar todos los documentos requeridos (DUI Frente/Reverso, Licencia Frente y Comprobante de Domicilio).');
      return;
    }

    if (!acceptTerms) {
      setSubmitError('Debes aceptar los Términos y Condiciones y la Política de Privacidad.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('vehicleId', selectedVehicleId);
      formData.append('pickupDate', `${pickupDate}T${pickupTime}:00`);
      formData.append('returnDate', `${returnDate}T${returnTime}:00`);
      formData.append('pickupLocation', pickupLocation);
      formData.append('returnLocation', returnLocation);
      if (flightNumber) formData.append('flightNumber', flightNumber);

      formData.append('fullName', fullName);
      formData.append('documentNumber', documentNumber);
      formData.append('email', email);
      formData.append('phone', phone);
      if (birthDate) formData.append('birthDate', birthDate);
      formData.append('driverLicenseNumber', driverLicenseNumber);
      formData.append('licenseExpiryDate', licenseExpiryDate);
      if (address) formData.append('address', address);
      if (emergencyContactName) formData.append('emergencyContactName', emergencyContactName);
      if (emergencyContactPhone) formData.append('emergencyContactPhone', emergencyContactPhone);
      if (comments) formData.append('comments', comments);

      selectedExtras.forEach((id) => formData.append('extraIds[]', id));

      // Append files
      formData.append('duiFront', duiFront);
      formData.append('duiBack', duiBack);
      formData.append('licenseFront', licenseFront);
      formData.append('utilityBill', utilityBill);

      const res = await fetch('/api/requests/public', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud.');
      }

      setBookingSuccess({
        requestCode: data.requestCode,
        accessToken: data.accessToken,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err.message || 'Ocurrió un error inesperado al enviar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxem-bg py-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-luxem-accent animate-spin mx-auto mb-4" />
          <p className="text-luxem-night/70 font-medium">Cargando flota y disponibilidad...</p>
        </div>
      </div>
    );
  }

  // Confirmation view
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-luxem-bg py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>

            <h1 className="text-3xl font-bold text-luxem-night mb-2">¡Solicitud Recibida con Éxito!</h1>
            <p className="text-luxem-night/70 mb-8">
              Tu solicitud ha sido registrada en el sistema de LUXEM Rent a Car. Nuestro equipo verificará tu documentación y te notificará por correo electrónico y WhatsApp en menos de 2 horas hábiles.
            </p>

            <div className="bg-luxem-night text-white rounded-2xl p-6 mb-8 text-left">
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <span className="text-luxem-silver text-sm">Código de Solicitud:</span>
                <span className="font-mono font-bold text-lg text-luxem-accent">{bookingSuccess.requestCode}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <span className="text-luxem-silver text-sm">Vehículo:</span>
                <span className="font-bold">{selectedVehicle?.brand} {selectedVehicle?.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-luxem-silver">Fechas:</span>
                <span>{pickupDate} al {returnDate}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => router.push(`/solicitud/seguimiento?token=${bookingSuccess.accessToken}`)}
                className="w-full bg-luxem-primary hover:bg-luxem-accent text-white py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Ver Estado de mi Solicitud en Tiempo Real
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-luxem-night py-3 rounded-xl font-semibold transition"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxem-bg py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-luxem-night mb-2">
            Reserva tu Vehículo con Confianza
          </h1>
          <p className="text-luxem-night/70">
            Proceso 100% digital, validación ágil y confirmación transparente
          </p>

          {/* Stepper */}
          <div className="flex items-center justify-center max-w-lg mx-auto mt-8">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-luxem-primary text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${step >= 1 ? 'text-luxem-night' : 'text-gray-400'}`}>
                Itinerario
              </span>
            </div>
            <div className={`flex-1 h-1 mx-4 rounded ${step >= 2 ? 'bg-luxem-primary' : 'bg-gray-200'}`} />
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-luxem-primary text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${step >= 2 ? 'text-luxem-night' : 'text-gray-400'}`}>
                Datos
              </span>
            </div>
            <div className={`flex-1 h-1 mx-4 rounded ${step >= 3 ? 'bg-luxem-primary' : 'bg-gray-200'}`} />
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-luxem-primary text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${step >= 3 ? 'text-luxem-night' : 'text-gray-400'}`}>
                Documentos
              </span>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center gap-3 max-w-3xl mx-auto">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{submitError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* STEP 1: Itinerary & Vehicle */}
              {step === 1 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
                  <h2 className="text-xl font-bold text-luxem-night flex items-center gap-2">
                    <Car className="w-5 h-5 text-luxem-accent" />
                    Paso 1: Selección de Vehículo y Fechas
                  </h2>

                  {/* Vehicle Picker */}
                  <div>
                    <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                      Vehículo Seleccionado
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {vehicles.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVehicleId(v.id)}
                          className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                            selectedVehicleId === v.id
                              ? 'border-luxem-primary bg-luxem-primary/5 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-luxem-primary">
                            <Car className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-luxem-night truncate">
                              {v.brand} {v.name}
                            </div>
                            <div className="text-xs text-luxem-night/60">
                              ${(v.dailyPrice / 100).toFixed(2)}/día · {v.category.name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dates & Times */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Fecha y Hora de Entrega
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm font-medium"
                          required
                        />
                        <input
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-28 px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm font-medium"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Fecha y Hora de Devolución
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm font-medium"
                          required
                        />
                        <input
                          type="time"
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          className="w-28 px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm font-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Lugar de Entrega
                      </label>
                      <select
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm font-medium bg-white"
                      >
                        {LOCATIONS.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Lugar de Devolución
                      </label>
                      <select
                        value={returnLocation}
                        onChange={(e) => setReturnLocation(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm font-medium bg-white"
                      >
                        {LOCATIONS.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {pickupLocation === 'SAL_AEROPUERTO' && (
                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Número de Vuelo (Opcional - Monitoreamos retrasos)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: AV 520 / UA 1245"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                      />
                    </div>
                  )}

                  {/* Extras */}
                  {extras.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Servicios y Adicionales
                      </label>
                      <div className="space-y-2">
                        {extras.map((extra) => (
                          <label
                            key={extra.id}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                              selectedExtras.includes(extra.id)
                                ? 'border-luxem-primary bg-luxem-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedExtras.includes(extra.id)}
                                onChange={() => handleExtraToggle(extra.id)}
                                className="w-4 h-4 text-luxem-primary rounded focus:ring-luxem-accent"
                              />
                              <div>
                                <div className="text-sm font-bold text-luxem-night">{extra.name}</div>
                                {extra.description && (
                                  <div className="text-xs text-luxem-night/60">{extra.description}</div>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-bold text-luxem-primary">
                              {extra.pricePerDay > 0
                                ? `+$${(extra.pricePerDay / 100).toFixed(2)}/día`
                                : `+$${(extra.flatFee / 100).toFixed(2)} tarifa única`}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-luxem-primary hover:bg-luxem-accent text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    Continuar con Datos del Conductor
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* STEP 2: Personal Information */}
              {step === 2 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
                  <h2 className="text-xl font-bold text-luxem-night flex items-center gap-2">
                    <User className="w-5 h-5 text-luxem-accent" />
                    Paso 2: Datos Personales y Licencia
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Nombre Completo (según documento de identidad) *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ej: Carlos Eduardo Martínez López"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        DUI o Pasaporte *
                      </label>
                      <input
                        type="text"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        placeholder="01234567-8 o Pasaporte"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="carlos@ejemplo.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+503 7000-0000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Número de Licencia de Conducir *
                      </label>
                      <input
                        type="text"
                        value={driverLicenseNumber}
                        onChange={(e) => setDriverLicenseNumber(e.target.value)}
                        placeholder="Número de licencia"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Fecha de Vencimiento de Licencia *
                      </label>
                      <input
                        type="date"
                        value={licenseExpiryDate}
                        onChange={(e) => setLicenseExpiryDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Dirección Residencial
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Colonia, calle, número de casa, municipio"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Contacto de Emergencia (Nombre)
                      </label>
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="Nombre de familiar"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                        Teléfono de Emergencia
                      </label>
                      <input
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        placeholder="+503 7111-1111"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold transition flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-luxem-primary hover:bg-luxem-accent text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      Continuar a Carga de Documentos
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Mandatory Document Upload */}
              {step === 3 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-luxem-night flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-5 h-5 text-luxem-accent" />
                      Paso 3: Verificación de Identidad y Requisitos
                    </h2>
                    <p className="text-sm text-luxem-night/60">
                      Por normativa de seguridad en El Salvador y póliza de seguro, es obligatorio adjuntar fotografía legible o PDF de los siguientes 3 documentos.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* DUI Front */}
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-luxem-primary transition bg-gray-50/50">
                      <Upload className="w-8 h-8 text-luxem-primary mx-auto mb-2" />
                      <div className="text-xs font-bold text-luxem-night uppercase tracking-wider mb-1">
                        DUI o Pasaporte (Frente) *
                      </div>
                      <p className="text-xs text-gray-500 mb-3">JPG, PNG o PDF (máx. 10MB)</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setDuiFront(e.target.files?.[0] || null)}
                        className="text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-luxem-primary file:text-white hover:file:bg-luxem-accent cursor-pointer"
                        required
                      />
                      {duiFront && (
                        <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {duiFront.name}
                        </div>
                      )}
                    </div>

                    {/* DUI Back */}
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-luxem-primary transition bg-gray-50/50">
                      <Upload className="w-8 h-8 text-luxem-primary mx-auto mb-2" />
                      <div className="text-xs font-bold text-luxem-night uppercase tracking-wider mb-1">
                        DUI (Reverso) *
                      </div>
                      <p className="text-xs text-gray-500 mb-3">JPG, PNG o PDF (máx. 10MB)</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setDuiBack(e.target.files?.[0] || null)}
                        className="text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-luxem-primary file:text-white hover:file:bg-luxem-accent cursor-pointer"
                        required
                      />
                      {duiBack && (
                        <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {duiBack.name}
                        </div>
                      )}
                    </div>

                    {/* Driver License */}
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-luxem-primary transition bg-gray-50/50">
                      <Upload className="w-8 h-8 text-luxem-primary mx-auto mb-2" />
                      <div className="text-xs font-bold text-luxem-night uppercase tracking-wider mb-1">
                        Licencia de Conducir (Frente) *
                      </div>
                      <p className="text-xs text-gray-500 mb-3">Vigente. JPG, PNG o PDF</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setLicenseFront(e.target.files?.[0] || null)}
                        className="text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-luxem-primary file:text-white hover:file:bg-luxem-accent cursor-pointer"
                        required
                      />
                      {licenseFront && (
                        <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {licenseFront.name}
                        </div>
                      )}
                    </div>

                    {/* Utility Bill */}
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:border-luxem-primary transition bg-gray-50/50">
                      <Upload className="w-8 h-8 text-luxem-primary mx-auto mb-2" />
                      <div className="text-xs font-bold text-luxem-night uppercase tracking-wider mb-1">
                        Recibo de Agua o Luz (Domicilio) *
                      </div>
                      <p className="text-xs text-gray-500 mb-3">Máx. 3 meses de antigüedad</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setUtilityBill(e.target.files?.[0] || null)}
                        className="text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-luxem-primary file:text-white hover:file:bg-luxem-accent cursor-pointer"
                        required
                      />
                      {utilityBill && (
                        <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {utilityBill.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-xs font-bold text-luxem-night/70 uppercase tracking-wider mb-2">
                      Comentarios o requerimientos especiales
                    </label>
                    <textarea
                      rows={2}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Indícanos si tienes alguna preferencia para la entrega..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-luxem-primary text-sm"
                    />
                  </div>

                  {/* Terms acceptance */}
                  <label className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-5 h-5 text-luxem-primary rounded mt-0.5 focus:ring-luxem-accent"
                      required
                    />
                    <div className="text-xs text-luxem-night/80 leading-relaxed">
                      Declaro bajo juramento que los datos y documentos proporcionados son verídicos y vigentes. Acepto los{' '}
                      <a href="/terminos" target="_blank" className="text-luxem-primary font-bold underline">
                        Términos y Condiciones
                      </a>{' '}
                      del servicio de arrendamiento y la{' '}
                      <a href="/privacidad" target="_blank" className="text-luxem-primary font-bold underline">
                        Política de Privacidad
                      </a>{' '}
                      para el tratamiento seguro de mis documentos de identidad.
                    </div>
                  </label>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={submitting}
                      className="px-6 py-4 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold transition flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-luxem-primary hover:bg-luxem-accent disabled:opacity-50 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-xl"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Subiendo Documentos y Enviando Solicitud...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Enviar Solicitud de Reserva
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar Quotation Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24 space-y-6">
              <h3 className="font-bold text-lg text-luxem-night border-b pb-4">
                Resumen de Arrendamiento
              </h3>

              {selectedVehicle && (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-luxem-primary">
                    <Car className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-luxem-night leading-snug">
                      {selectedVehicle.brand} {selectedVehicle.name}
                    </h4>
                    <span className="text-xs text-luxem-night/60">
                      {selectedVehicle.category.name} · {selectedVehicle.year}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs border-y py-4 text-luxem-night/80">
                <div className="flex justify-between">
                  <span className="text-luxem-night/60">Entrega:</span>
                  <span className="font-semibold text-right">{pickupDate} ({pickupTime})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-luxem-night/60">Devolución:</span>
                  <span className="font-semibold text-right">{returnDate} ({returnTime})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-luxem-night/60">Lugar Entrega:</span>
                  <span className="font-semibold text-right max-w-[160px] truncate">
                    {LOCATIONS.find((l) => l.id === pickupLocation)?.name}
                  </span>
                </div>
              </div>

              {loadingQuote ? (
                <div className="py-8 text-center text-xs text-luxem-night/60 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-luxem-accent" />
                  Calculando cotización oficial...
                </div>
              ) : quote ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-luxem-night/70">
                    <span>Días de alquiler:</span>
                    <span className="font-bold text-luxem-night">{quote.rentalDays} días</span>
                  </div>
                  <div className="flex justify-between text-xs text-luxem-night/70">
                    <span>Tarifa diaria:</span>
                    <span>${(quote.dailyRate / 100).toFixed(2)}/día</span>
                  </div>
                  <div className="flex justify-between text-xs text-luxem-night/70">
                    <span>Subtotal días:</span>
                    <span>${(quote.daysSubtotal / 100).toFixed(2)}</span>
                  </div>
                  {quote.volumeDiscountAmount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                      <span>Descuento por volumen:</span>
                      <span>-${(quote.volumeDiscountAmount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {quote.extrasTotal > 0 && (
                    <div className="flex justify-between text-xs text-luxem-night/70">
                      <span>Adicionales:</span>
                      <span>+${(quote.extrasTotal / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {quote.locationFee > 0 && (
                    <div className="flex justify-between text-xs text-luxem-night/70">
                      <span>Cargo de entrega:</span>
                      <span>+${(quote.locationFee / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-luxem-night/70">
                    <span>IVA (13%):</span>
                    <span>${(quote.taxAmount / 100).toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-sm text-luxem-night">Total Arrendamiento:</span>
                    <span className="text-2xl font-black text-luxem-primary">
                      ${(quote.total / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/50 mt-4">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-1">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Depósito en Garantía (Reembolsable):
                    </div>
                    <div className="text-sm font-extrabold text-amber-900">
                      ${(quote.securityDeposit / 100).toFixed(2)} USD
                    </div>
                    <p className="text-[11px] text-amber-800/80 mt-1">
                      Se retiene en tarjeta o transferencia al retirar y se libera al devolver el vehículo sin daños ni multas.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="border-t pt-4 text-center">
                <p className="text-[11px] text-luxem-night/50">
                  Transacciones seguras en Dólares Estadounidenses (USD). Sin cargos ocultos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-luxem-bg py-24">
        <Loader2 className="w-12 h-12 text-luxem-accent animate-spin mx-auto" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
