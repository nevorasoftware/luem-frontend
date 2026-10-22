import React from 'react';
import { ShieldCheck, Lock, FileCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-luxem-bg py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-luxem-accent" />
            <div>
              <h1 className="text-3xl font-black text-luxem-night">Política de Privacidad y Tratamiento de Datos</h1>
              <p className="text-xs text-luxem-night/60">Compromiso de Confidencialidad y Seguridad · LUEM RENT A CAR</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-luxem-night/80 space-y-6 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-luxem-night mb-2">1. Recopilación de Documentos de Identidad</h2>
              <p>
                Para la prestación segura del servicio de arrendamiento vehicular y en cumplimiento de regulaciones aseguradoras y comerciales en El Salvador, LUEM RENT A CAR recopila imágenes digitales de su DUI o Pasaporte, Licencia de Conducir y Comprobante de Domicilio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-luxem-night mb-2">2. Almacenamiento Seguro y Cifrado</h2>
              <p>
                Todos los documentos subidos son almacenados en infraestructura protegida con cifrado en reposo (AES-256) y transmisión segura mediante HTTPS/TLS 1.3. El acceso está restringido exclusivamente al personal autorizado del área de operaciones y validación de riesgo.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-luxem-night mb-2">3. No Divulgación a Terceros</h2>
              <p>
                LUEM no vende, comercializa ni comparte su información personal ni documentos de identidad con empresas de mercadeo u otras organizaciones ajenas a la relación contractual, salvo mandato judicial expreso de autoridades competentes de la República de El Salvador o la compañía aseguradora en caso de siniestro.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-luxem-night mb-2">4. Derechos del Titular de los Datos</h2>
              <p>
                Usted tiene derecho a consultar, rectificar o solicitar la eliminación de sus datos personales una vez concluido el período legal de retención tributaria y contractual estipulado por la legislación salvadoreña escribiendo a <strong>privacidad@luemrentacar.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
