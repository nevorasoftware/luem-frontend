'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Inbox, CalendarCheck, Car, Users, 
  Wrench, Settings, LogOut, Menu, X, Shield, ChevronRight, UserCircle 
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Solicitudes', href: '/admin/solicitudes', icon: Inbox },
  { label: 'Reservas', href: '/admin/reservas', icon: CalendarCheck },
  { label: 'Flota / Vehículos', href: '/admin/vehiculos', icon: Car },
  { label: 'Clientes', href: '/admin/clientes', icon: Users },
  { label: 'Mantenimiento', href: '/admin/mantenimiento', icon: Wrench },
  { label: 'Configuración', href: '/admin/configuracion', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string } | null>(null);

  // If on login page, don't show admin shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((user) => {
        if (user) setCurrentUser(user);
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-luxem-bg flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-luxem-night text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-luxem-primary flex items-center justify-center font-bold text-sm">
            LX
          </div>
          <span className="font-bold text-sm">LUXEM Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-luxem-silver hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-40 w-64 bg-luxem-night text-white flex flex-col transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-white/10 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-luxem-primary to-luxem-accent flex items-center justify-center font-extrabold text-white text-lg shadow-lg">
            LX
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wider text-white">LUXEM</div>
            <div className="text-[10px] text-luxem-silver/70 font-semibold uppercase tracking-widest">
              Backoffice
            </div>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-luxem-primary text-white shadow-md'
                    : 'text-luxem-silver hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-luxem-accent'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Current User & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 mb-3">
            <UserCircle className="w-9 h-9 text-luxem-accent flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Administrador'}
              </div>
              <div className="text-[10px] text-luxem-silver/70 truncate uppercase font-semibold">
                {currentUser?.role || 'ADMIN'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
