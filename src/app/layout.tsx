import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'LUEM RENT A CAR — Alquiler de Vehículos en El Salvador',
  description:
    'Alquiler de vehículos en El Salvador. Flota moderna de sedanes, camionetas SUV y pick-ups 4x4. Reserva en línea fácil y segura con entrega en San Salvador y Aeropuerto SAL.',
  keywords: [
    'rent a car el salvador',
    'alquiler de carros el salvador',
    'renta de autos aeropuerto el salvador',
    'luxem rent a car',
    'alquiler de camionetas 4x4 el salvador',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#F4F6F8] text-[#1E293B]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
