import React from 'react';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-luxem-bg py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-luxem-accent" />
            <div>
              <h1 className="text-3xl font-black text-luxem-night">Términos y Condiciones de Servicio</h1>
              <p className="text-xs text-luxem-night/60">Última actualización: Enero 2025 · El Salvador</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-luxem-night/80 space-y-6 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-luxem-night mb-2">1. Requisitos para el Arrendatario y Conductores</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Edad mínima requerida: 21 años cumplidos.</li>
                <li>Documento Único de Identidad (DUI) salvadoreño vigente o Pasaporte original para extranjeros.</li>
                <li>Licencia de conducir vigente con al menos 2 años de antigüedad desde su expedición.</li>
                <li>Comprobante de domicilio reciente (recibo de energía eléctrica o agua potable de hasta 3 meses).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-luxem-night mb-2">2. Depósito en Garantía</h2>
              <p>
                Al momento de la entrega del vehículo, es obligatorio autorizar un depósito en garantía reembolsable según la categoría del vehículo ($300 - $800 USD). El depósito puede garantizarse mediante tarjeta de crédito, débito o transferencia bancaria local. Dicho importe será liberado en su totalidad tras la inspección de devolución si la unidad se entrega en el mismo estado, con el nivel de combustible pactado y sin multas de tránsito.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-luxem-night mb-2">3. Política de Combustible e Inspección</h2>
              <p>
                La unidad se entrega con el tanque lleno (o nivel documentado en el acta de entrega) y debe devolverse con la misma cantidad de combustible. Si el vehículo se devuelve con menor cantidad, se cobrará el costo del combustible faltante más una tarifa administrativa de servicio de recarga.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-luxem-night mb-2">4. Cobertura del Seguro y Deducible</h2>
              <p>
                Todas las tarifas incluyen cobertura de responsabilidad civil contra terceros y seguro contra colisión y robo sujeto a deducible. El cliente es responsable hasta por el monto del deducible acordado en caso de siniestro, siempre que se cumplan las leyes de tránsito salvadoreñas y no medie negligencia grave o conducción bajo influencia de alcohol o sustancias.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-luxem-night mb-2">5. Jurisdicción y Ley Aplicable</h2>
              <p>
                Este contrato de arrendamiento se rige por las leyes de la República de El Salvador. Cualquier disputa o controversia será dirimida en los tribunales competentes de la ciudad de San Salvador.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
