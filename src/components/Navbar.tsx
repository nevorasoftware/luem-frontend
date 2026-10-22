'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Car, Menu, X, Phone, Search, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0B1220]/95 backdrop-blur-md border-b border-[#1769AA]/30 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo y Marca */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#1769AA] to-[#299BEB] flex items-center justify-center shadow-lg shadow-[#299BEB]/20 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-wider text-white">
                LUEM
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#299BEB] font-semibold -mt-1">
                Rent a Car • El Salvador
              </span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/"
              className="text-[#C7D0DA] hover:text-white transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/vehiculos"
              className="text-[#C7D0DA] hover:text-white transition-colors"
            >
              Catálogo de Vehículos
            </Link>
            <Link
              href="/#beneficios"
              className="text-[#C7D0DA] hover:text-white transition-colors"
            >
              Beneficios
            </Link>
            <Link
              href="/#preguntas-frecuentes"
              className="text-[#C7D0DA] hover:text-white transition-colors"
            >
              Preguntas Frecuentes
            </Link>
            <Link
              href="/solicitud/seguimiento"
              className="flex items-center gap-1.5 text-[#299BEB] hover:text-white transition-colors bg-[#1769AA]/20 px-3 py-1.5 rounded-full border border-[#299BEB]/30"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Consultar Solicitud</span>
            </Link>
          </nav>

          {/* Botones de acción */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://wa.me/50377778888?text=Hola,%20quisiera%20informaci%C3%B3n%20sobre%20el%20alquiler%20de%20un%20veh%C3%ADculo%20en%20LUEM"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-[#C7D0DA] hover:text-white px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#299BEB]" />
              <span>WhatsApp</span>
            </a>

            <Link
              href="/vehiculos"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#1769AA] to-[#299BEB] hover:from-[#13568c] hover:to-[#2284c9] shadow-lg shadow-[#1769AA]/30 transition-all hover:scale-[1.02]"
            >
              Reservar Ahora
            </Link>
          </div>

          {/* Botón Móvil */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/solicitud/seguimiento"
              className="p-2 text-[#299BEB] hover:text-white"
              title="Consultar Solicitud"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B1220] border-b border-[#1769AA]/40 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/5"
          >
            Inicio
          </Link>
          <Link
            href="/vehiculos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/5"
          >
            Catálogo de Vehículos
          </Link>
          <Link
            href="/#beneficios"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/5"
          >
            Beneficios
          </Link>
          <Link
            href="/#preguntas-frecuentes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/5"
          >
            Preguntas Frecuentes
          </Link>
          <Link
            href="/solicitud/seguimiento"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-[#299BEB] bg-[#1769AA]/15 border border-[#299BEB]/30"
          >
            Consultar Estado de Solicitud
          </Link>
          <div className="pt-2">
            <Link
              href="/vehiculos"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#1769AA] to-[#299BEB]"
            >
              Reservar Vehículo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
