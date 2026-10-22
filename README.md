# LUEM Rent a Car — Frontend Web Application

Plataforma web moderna, reactiva y elegante para la reserva de vehículos y administración de flota para **LUEM Rent a Car** en El Salvador.

Desarrollada con **Next.js 15**, **React 19**, **Tailwind CSS 3** y **TypeScript**.

---

## 🌟 Características Principales

### Experiencia del Cliente (Público)
- **Home & Hero Dinámico:** Buscador de disponibilidad por fecha y sucursal (Aeropuerto Int. San Óscar Arnulfo Romero - SAL, San Salvador, Santa Ana, San Miguel).
- **Catálogo Interactivo (`/vehiculos`):** Filtros en tiempo real por categoría (SUV, Sedán, Pick-up, Económico), transmisión y pasajeros.
- **Detalle de Vehículo (`/vehiculos/[slug]`):** Ficha técnica detallada, cotizador en vivo (`/api/fleet/quote`) y desglose transparente de costos (tarifa diaria, IVA 13%, depósito en garantía).
- **Flujo de Reserva en 3 Pasos (`/reservar`):**
  1. Selección de itinerario, horarios, sucursales y extras.
  2. Datos del conductor y contacto de emergencia.
  3. **Carga obligatoria de documentos de identidad:** DUI frente/reverso, Licencia de conducir vigente y Recibo de domicilio (agua/luz).
- **Seguimiento Seguro con Token (`/solicitud/seguimiento`):** Consulta del estado del trámite en tiempo real, cronología de eventos y reenvío de documentos en caso de requerirse corrección.
- **Términos y Privacidad (`/terminos`, `/privacidad`):** Divulgación contractual y tratamiento de datos protegidos.

### Panel Administrativo (`/admin`)
- **Login Seguro (`/admin/login`):** Autenticación con cookies HttpOnly y sesión en base de datos.
- **Dashboard Operativo (`/admin`):** KPIs en tiempo real de ocupación de flota, solicitudes pendientes de revisión, reservas activas e ingresos del mes.
- **Bandeja de Solicitudes (`/admin/solicitudes`):**
  - Visualización y auditoría de documentos subidos.
  - Aprobación atómica con asignación de unidad física y bloqueo de calendario (anti-doble reserva).
  - Solicitud de reenvío de documentos o rechazo motivado.
- **Gestión de Reservas (`/admin/reservas`):** Registro de abonos/pagos y actas de inspección vehicular digital (Entrega y Devolución con combustible, kilometraje y daños).
- **Flota y Vehículos (`/admin/vehiculos`):** Alta de vehículos y control de estados (`DISPONIBLE`, `MANTENIMIENTO`, `INACTIVO`).
- **Directorio de Clientes (`/admin/clientes`):** Búsqueda por DUI y control de riesgo (bloqueo/desbloqueo).
- **Taller y Mantenimiento (`/admin/mantenimiento`):** Programación de servicios mecánicos preventivos.
- **Configuración Comercial (`/admin/configuracion`):** Edición de datos fiscales, canales de atención y depósito base.

---

## 🎨 Paleta de Color Corporativa
- **Azul Noche:** `#0B1220`
- **Azul Corporativo:** `#1769AA`
- **Azul Eléctrico (Acento):** `#299BEB`
- **Plata:** `#C7D0DA`
- **Fondo Claro:** `#F4F6F8`

---

## 🚀 Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
npm start
```
