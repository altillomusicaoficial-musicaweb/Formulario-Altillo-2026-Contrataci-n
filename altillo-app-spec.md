# ALTILLO MÚSICA — Especificación Técnica de la Aplicación

## 1. VISIÓN GENERAL

**Altillo** es un proyecto musical con sede en Madrid. Esta aplicación gestiona todo el flujo de trabajo de contratación, producción técnica, finanzas y logística de conciertos.

### Usuarios
- **Programadores/Promotores** (externos): acceden al formulario público de contratación.
- **Equipo Altillo** (internas): gestionan presupuestos, riders, calendario y finanzas desde un panel privado.

### Arquitectura recomendada
- **Frontend**: React + Tailwind CSS (PWA para acceso desde móvil como app)
- **Backend**: Node.js con Express (o Next.js full-stack)
- **Base de datos**: PostgreSQL (o Supabase para simplificar)
- **Despliegue**: Vercel o Railway (gratis/barato para este volumen)
- **Dominio**: app.altillomusica.com (enlazado desde la web Wix)

---

## 2. MÓDULOS DE LA APLICACIÓN

### MÓDULO 1: Portal de Contratación (público)

**URL pública**: app.altillomusica.com/contratar

Formulario que rellenan los programadores/promotores. Al enviarlo, NO ven resultado alguno, solo un mensaje de confirmación.

#### Campos del formulario:

```
DATOS DEL EVENTO
- nombre_programador: string (obligatorio)
- email: string (obligatorio)
- telefono: string (opcional)
- nombre_evento: string (obligatorio)
- fecha_evento: date (obligatorio)
- hora_evento: time (obligatorio)
- nombre_espacio: string (obligatorio)
- ciudad: string (obligatorio)
- direccion_espacio: string (obligatorio)
- distancia_madrid_km: number (se puede calcular automáticamente)

TIPO DE SOLICITUD (elegir uno):
- tipo_solicitud: "elegir_formato" | "presupuesto_cerrado"

SI ELIGE FORMATO:
- formato: "duo" | "trio" | "cuarteto" | "quinteto"
- incluye_visuales: boolean
- incluye_tecnico_sonido: boolean
- incluye_tecnico_luces: boolean
- incluye_equipo_tecnico_completo: boolean

SI ELIGE PRESUPUESTO CERRADO:
- presupuesto_disponible: number (€)

LOGÍSTICA
- hospedaje_incluido: boolean
- hospedaje_cerca_venue: boolean (si hospedaje_incluido = true)
- num_habitaciones_disponibles: number (si hospedaje_incluido = true)
- catering_incluido: boolean
- parking_disponible: boolean

NOTAS
- notas_adicionales: text (opcional)
```

#### Mensaje post-envío:
"¡Gracias! Tu solicitud ha sido recibida. En un máximo de 24 horas recibirás un desglose detallado por email."

---

### MÓDULO 2: Panel Interno de Gestión de Solicitudes

**URL privada**: app.altillomusica.com/admin (protegido con login)

#### Vista lista de solicitudes:
- Tabla con: fecha solicitud, nombre programador, evento, fecha evento, tipo solicitud, estado
- Estados: "nueva" | "en_revision" | "presupuesto_enviado" | "aceptado" | "rechazado"
- Filtros por estado y fecha

#### Vista detalle de solicitud:
- Toda la información del formulario
- **Generador de presupuesto**: según los datos, la app calcula automáticamente opciones
- Las integrantes de Altillo pueden:
  - Ver las opciones generadas
  - Descartar opciones que no les apetezcan
  - Ajustar precios manualmente
  - Añadir notas internas
  - Aprobar y enviar presupuesto al programador (por email)

---

### MÓDULO 3: Generador de Presupuestos

#### Tarifas base (EDITABLES desde el panel admin):

```javascript
const TARIFAS_BASE = {
  // Caché artístico por formato
  formatos: {
    duo:      { precio: 1200, descripcion: "Voz + instrumento" },
    trio:     { precio: 1800, descripcion: "Voz + 2 instrumentos" },
    cuarteto: { precio: 2400, descripcion: "Voz + 3 instrumentos" },
    quinteto: { precio: 3000, descripcion: "Voz + 4 instrumentos" },
  },

  // Extras técnicos
  tecnico_sonido:             { precio: 350, descripcion: "Técnico de sonido propio" },
  tecnico_luces:              { precio: 300, descripcion: "Técnico de iluminación propio" },
  equipo_tecnico_completo:    { precio: 800, descripcion: "PA + mesa + microfonía + cableado" },
  visuales:                   { precio: 500, descripcion: "Proyección de visuales en directo" },

  // Desplazamiento
  desplazamiento: {
    precio_por_km:        0.30,   // €/km (ida y vuelta)
    km_incluidos_gratis:  50,     // Primeros 50 km sin cargo
  },

  // Hospedaje (si NO lo proporciona el programador)
  hospedaje: {
    precio_por_persona_noche: 60, // €/persona/noche
  },

  // Dietas
  dietas: {
    por_persona_dia: 25, // €/persona/día
  },
};
```

#### Lógica de cálculo:

```
PRESUPUESTO TOTAL =
  caché del formato elegido
  + extras técnicos seleccionados
  + desplazamiento (si distancia > 50km)
  + hospedaje (si no incluido por programador × num personas × noches)
  + dietas (num personas × días)
```

#### Si el programador da presupuesto cerrado:
La app genera combinaciones posibles que encajen en ese presupuesto, priorizando:
1. Formato más grande posible
2. Con técnicos si cabe
3. Con visuales si cabe

---

### MÓDULO 4: Riders Técnicos

Una vez aceptado un presupuesto, se genera automáticamente el rider técnico.

#### Plantillas de rider por formato:

```javascript
const RIDERS = {
  duo: {
    nombre: "Rider Técnico - Dúo",
    necesidades: [
      "1 micrófono vocal (SM58 o similar)",
      "1 línea de instrumento (DI box)",
      "2 monitores de escenario",
      "Mesa de mezclas mínimo 8 canales",
    ],
    escenario_minimo: "3m x 2m",
    sonido_minimo: "500W PA",
  },
  trio: {
    nombre: "Rider Técnico - Trío",
    necesidades: [
      "2 micrófonos vocales (SM58 o similar)",
      "1 micrófono de percusión / overhead",
      "2 líneas de instrumento (DI box)",
      "3 monitores de escenario",
      "Mesa de mezclas mínimo 12 canales",
    ],
    escenario_minimo: "4m x 3m",
    sonido_minimo: "1000W PA",
  },
  cuarteto: {
    nombre: "Rider Técnico - Cuarteto",
    necesidades: [
      "2 micrófonos vocales (SM58 o similar)",
      "2 micrófonos de percusión / overhead",
      "2 líneas de instrumento (DI box)",
      "4 monitores de escenario",
      "Mesa de mezclas mínimo 16 canales",
    ],
    escenario_minimo: "5m x 4m",
    sonido_minimo: "2000W PA",
  },
  quinteto: {
    nombre: "Rider Técnico - Quinteto",
    necesidades: [
      "3 micrófonos vocales (SM58 o similar)",
      "2 micrófonos de percusión / overhead",
      "3 líneas de instrumento (DI box)",
      "5 monitores de escenario",
      "Mesa de mezclas mínimo 20 canales",
    ],
    escenario_minimo: "6m x 4m",
    sonido_minimo: "3000W PA",
  },
};

// Si incluye técnico de sonido propio → añadir sección
// Si incluye técnico de luces → añadir sección con rider de luces
// Si incluye visuales → añadir sección con requisitos de proyección
```

---

### MÓDULO 5: Calendario y Hojas de Ruta

#### Calendario:
- Vista mensual con todos los conciertos contratados
- Código de colores por estado (confirmado, pendiente, pasado)
- Click en evento → detalle completo

#### Hoja de ruta (generada automáticamente):

```
HOJA DE RUTA — [Nombre del evento]
Fecha: [fecha]
Lugar: [espacio, ciudad]
Formato: [dúo/trío/cuarteto/quinteto]
Distancia desde Madrid: [X km]
Hora de salida estimada: [calculada según distancia]
Hora de prueba de sonido: [hora_evento - 3h]
Hora de show: [hora_evento]
Equipo que viaja: [nombres según formato]
Técnicos: [sí/no - quiénes]
Hospedaje: [detalles]
Contacto programador: [nombre, teléfono, email]
Notas: [notas adicionales]
```

---

### MÓDULO 6: Finanzas (integración)

#### Vinculación con presupuestos:
- Cuando un presupuesto se marca como "aceptado" → se crea entrada en finanzas
- Estados financieros: "factura_pendiente" | "facturado" | "cobrado"
- Vista de ingresos por mes (actual y proyectado)

#### Campos de la entrada financiera:
```
- id_presupuesto: referencia al presupuesto
- fecha_evento: date
- importe_total: number
- estado_pago: "pendiente" | "facturado" | "cobrado"
- fecha_factura: date (nullable)
- fecha_cobro: date (nullable)
- metodo_pago: "transferencia" | "efectivo" | "otro"
- notas: text
```

---

## 3. ESTRUCTURA DE BASE DE DATOS

```sql
-- Solicitudes de contratación
CREATE TABLE solicitudes (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Datos programador
  nombre_programador VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  -- Datos evento
  nombre_evento VARCHAR(255) NOT NULL,
  fecha_evento DATE NOT NULL,
  hora_evento TIME NOT NULL,
  nombre_espacio VARCHAR(255) NOT NULL,
  ciudad VARCHAR(255) NOT NULL,
  direccion_espacio TEXT NOT NULL,
  distancia_madrid_km DECIMAL(10,2),
  -- Tipo solicitud
  tipo_solicitud VARCHAR(20) NOT NULL, -- 'elegir_formato' o 'presupuesto_cerrado'
  formato VARCHAR(20), -- duo, trio, cuarteto, quinteto
  incluye_visuales BOOLEAN DEFAULT FALSE,
  incluye_tecnico_sonido BOOLEAN DEFAULT FALSE,
  incluye_tecnico_luces BOOLEAN DEFAULT FALSE,
  incluye_equipo_tecnico BOOLEAN DEFAULT FALSE,
  presupuesto_disponible DECIMAL(10,2),
  -- Logística
  hospedaje_incluido BOOLEAN DEFAULT FALSE,
  hospedaje_cerca_venue BOOLEAN DEFAULT FALSE,
  num_habitaciones INTEGER,
  catering_incluido BOOLEAN DEFAULT FALSE,
  parking_disponible BOOLEAN DEFAULT FALSE,
  -- Notas
  notas_adicionales TEXT,
  -- Estado
  estado VARCHAR(30) DEFAULT 'nueva',
  notas_internas TEXT
);

-- Presupuestos generados
CREATE TABLE presupuestos (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER REFERENCES solicitudes(id),
  created_at TIMESTAMP DEFAULT NOW(),
  -- Desglose
  cache_formato DECIMAL(10,2),
  coste_tecnico_sonido DECIMAL(10,2) DEFAULT 0,
  coste_tecnico_luces DECIMAL(10,2) DEFAULT 0,
  coste_equipo_tecnico DECIMAL(10,2) DEFAULT 0,
  coste_visuales DECIMAL(10,2) DEFAULT 0,
  coste_desplazamiento DECIMAL(10,2) DEFAULT 0,
  coste_hospedaje DECIMAL(10,2) DEFAULT 0,
  coste_dietas DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),
  -- Estado
  estado VARCHAR(30) DEFAULT 'borrador',
  enviado_at TIMESTAMP,
  aceptado_at TIMESTAMP,
  notas TEXT
);

-- Riders técnicos
CREATE TABLE riders (
  id SERIAL PRIMARY KEY,
  presupuesto_id INTEGER REFERENCES presupuestos(id),
  formato VARCHAR(20),
  contenido_rider JSONB, -- contenido del rider
  incluye_tecnico_sonido BOOLEAN,
  incluye_tecnico_luces BOOLEAN,
  incluye_visuales BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Finanzas
CREATE TABLE finanzas (
  id SERIAL PRIMARY KEY,
  presupuesto_id INTEGER REFERENCES presupuestos(id),
  fecha_evento DATE,
  importe_total DECIMAL(10,2),
  estado_pago VARCHAR(20) DEFAULT 'pendiente',
  fecha_factura DATE,
  fecha_cobro DATE,
  metodo_pago VARCHAR(50),
  notas TEXT
);

-- Tarifas configurables
CREATE TABLE tarifas (
  id SERIAL PRIMARY KEY,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  descripcion VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Equipo artístico
CREATE TABLE equipo (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  instrumento VARCHAR(255),
  rol VARCHAR(100), -- 'artista', 'tecnico_sonido', 'tecnico_luces', 'tecnico_visuales'
  activo BOOLEAN DEFAULT TRUE
);
```

---

## 4. PWA (Progressive Web App)

Para que funcione como "app" en el móvil, el proyecto debe incluir:

```json
// public/manifest.json
{
  "name": "Altillo Música",
  "short_name": "Altillo",
  "description": "Gestión de contrataciones y producción",
  "start_url": "/admin",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#d4a574",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Y un service worker básico para funcionalidad offline.

---

## 5. FLUJO COMPLETO

```
1. Programador accede a app.altillomusica.com/contratar
2. Rellena formulario (formato o presupuesto cerrado)
3. Envía → ve mensaje "Gracias, en 24h recibirás desglose"
4. Altillo recibe notificación (email + panel admin)
5. Altillo abre solicitud en panel → ve opciones generadas
6. Altillo ajusta, descarta, aprueba → envía presupuesto por email
7. Programador acepta → Altillo marca como aceptado
8. Se genera rider técnico automáticamente
9. Se crea entrada en finanzas (ingreso futuro)
10. Aparece en calendario con toda la info
11. Se genera hoja de ruta del concierto
```

---

## 6. PROMPT PARA CLAUDE CODE

Copia este prompt en Claude Code para generar el proyecto:

---

**PROMPT:**

Crea una aplicación web full-stack llamada "Altillo Música" con Next.js 14 (App Router), Tailwind CSS, y SQLite (con better-sqlite3 para simplicidad). La app debe ser una PWA.

**Estética**: Tono cálido, elegante, musical. Colores tierra/dorados sobre fondo oscuro. Tipografía: usa Google Fonts (sugerencia: "Playfair Display" para títulos, "DM Sans" para cuerpo). Diseño limpio y profesional.

**Estructura de la app:**

1. **Ruta pública `/contratar`**: Formulario de contratación para promotores musicales. Dos modos: "Elegir formato" (dúo/trío/cuarteto/quinteto + extras: visuales, técnico sonido, técnico luces, equipo técnico) o "Tengo presupuesto cerrado" (introduce cantidad). Además: datos del evento (nombre, fecha, hora, espacio, ciudad, dirección, distancia desde Madrid), logística (hospedaje, catering, parking), notas. Al enviar: guardar en DB + mostrar "Gracias, en 24h recibirás un desglose".

2. **Ruta privada `/admin`** (protegida con contraseña simple): Panel con lista de solicitudes, filtros por estado. Click en solicitud → detalle con generador de presupuesto automático basado en tarifas configurables. Opciones para ajustar, aprobar, enviar.

3. **Ruta `/admin/tarifas`**: Tabla editable con todas las tarifas (formatos, técnicos, desplazamiento por km, hospedaje, dietas).

4. **Ruta `/admin/calendario`**: Vista calendario mensual con conciertos contratados. Click → detalle.

5. **Ruta `/admin/finanzas`**: Vista de ingresos pendientes/cobrados, vinculados a presupuestos aceptados.

6. **API routes** en `/api/*` para todas las operaciones CRUD.

7. **Generador de rider técnico**: según formato contratado, genera documento con necesidades técnicas.

8. **Generador de hoja de ruta**: datos completos del evento para el día del concierto.

Usa las tarifas base, estructura de DB, plantillas de rider y flujo detallados en la especificación adjunta.

---

## 7. NOTAS PARA DESARROLLO

- Empieza por Módulo 1 (formulario) + Módulo 2 (panel admin) + Módulo 3 (presupuestos)
- Módulo 4 (riders), 5 (calendario) y 6 (finanzas) pueden ir en segunda iteración
- SQLite es suficiente para empezar; migrar a PostgreSQL cuando haya más volumen
- El envío de emails se puede integrar después (Resend, SendGrid, o similar)
- Para el cálculo de distancia, se puede usar la API de Google Maps o simplemente input manual
