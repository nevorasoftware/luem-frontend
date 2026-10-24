'use client';

import React from 'react';
import Link from 'next/link';
import { Car, MapPin, Phone, Mail, Shield, Clock } from 'lucide-react';
import { usePublicSettings } from '@/lib/settings';

export default function Footer() {
  const { settings } = usePublicSettings();

  return (
    <footer className="bg-[#0B1220] border-t border-[#1769AA]/20 text-[#C7D0DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Columna 1: Marca */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1769AA] to-[#299BEB] flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-wider text-white">
                {settings.businessName || 'LUEM'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Servicio de alquiler de vehículos en El Salvador. Vehículos modernos,
              tarifas transparentes y atención personalizada desde su llegada al país.
            </p>
            <div className="pt-2 text-xs text-gray-500">
              Operando en El Salvador • Moneda: USD ($)
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Navegación
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/vehiculos" className="hover:text-white transition-colors">
                  Catálogo de Vehículos
                </Link>
              </li>
              <li>
                <Link href="/solicitud/seguimiento" className="hover:text-[#299BEB] transition-colors">
                  Consultar Solicitud / Reserva
                </Link>
              </li>
              <li>
                <Link href="/#beneficios" className="hover:text-white transition-colors">
                  Beneficios del Servicio
                </Link>
              </li>
              <li>
                <Link href="/#proceso" className="hover:text-white transition-colors">
                  Cómo Funciona
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Políticas y Términos
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/terminos" className="hover:text-white transition-colors">
                  Términos de Alquiler
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos#requisitos" className="hover:text-white transition-colors">
                  Requisitos de Conducción
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                  Acceso Administrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Atención al Cliente
            </h3>
            <ul className="space-y-3 text-sm">
              {settings.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#299BEB] shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </li>
              )}
              {(settings.phone || settings.whatsapp) && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#299BEB] shrink-0" />
                  <span>
                    {settings.phone}
                    {settings.phone && settings.whatsapp && ' / '}
                    {settings.whatsapp && `WhatsApp: ${settings.whatsapp}`}
                  </span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#299BEB] shrink-0" />
                  <span>{settings.email}</span>
                </li>
              )}
              {settings.hours && (
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#299BEB] shrink-0" />
                  <span>{settings.hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {settings.businessName || 'LUEM RENT A CAR'}. Todos los derechos reservados.</p>
          <p className="mt-2 md:mt-0 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#299BEB]" />
            <span>Alquiler seguro con documentación verificada</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

