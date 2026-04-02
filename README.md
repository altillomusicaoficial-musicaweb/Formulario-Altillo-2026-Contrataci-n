# Altillo Música — App de Gestión

Aplicación web full-stack para gestionar contrataciones, presupuestos, riders técnicos, calendario y contabilidad de **Altillo Música**.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS 3 |
| Base de datos | SQLite vía sql.js (archivo `data/altillo.db`) |
| Tipografías | Oswald + DM Sans (Google Fonts) |
| PWA | Service Worker + manifest.json |
| Lenguaje | TypeScript 5 |

---

## Arrancar en local

```bash
# Instalar dependencias
npm install

# Modo desarrollo → http://localhost:3000
npm run dev

# Build de producción
npm run build && npm start
```

---

## Estructura de rutas

### Públicas (para promotores y público general)

| URL | Descripción |
|---|---|
| `/` | Portada — hero ALTILLO, botones Contratación y Tour |
| `/contratar` | Formulario de solicitud de contratación |

### Admin (solo para el equipo Altillo, acceso por URL directa)

| URL | Descripción |
|---|---|
| `/admin` | Panel principal — tabla de todas las solicitudes |
| `/admin/solicitud/[id]` | Detalle de solicitud + presupuesto + rider + hoja de ruta |
| `/admin/tarifas` | Editor de tarifas base (cachés, técnicos, km, hospedaje, dietas) |
| `/admin/calendario` | Vista de próximos y pasados conciertos |
| `/admin/finanzas` | Contabilidad interna — estados de pago por evento |

> El panel admin **no aparece en la navegación pública**. Se accede directamente escribiendo la URL.

---

## API endpoints

| Método | Ruta | Función |
|---|---|---|
| GET / POST | `/api/solicitudes` | Listar / crear solicitudes |
| GET / PUT | `/api/solicitudes/[id]` | Ver / actualizar estado |
| GET / POST | `/api/presupuestos` | Crear presupuesto |
| GET / PATCH | `/api/presupuestos/[id]` | Ver / ajustar / enviar / aceptar presupuesto |
| GET / PATCH | `/api/tarifas` | Leer / actualizar tarifas |
| GET / PATCH | `/api/finanzas` | Leer / actualizar estados de cobro |

---

## Flujo completo

```
1. Promotor rellena /contratar → se guarda en DB con estado "nueva"
2. Equipo Altillo ve la solicitud en /admin
3. Desde el detalle, revisan y ajustan el presupuesto generado
4. Marcan como "presupuesto_enviado" y contactan al promotor
5. Si el promotor acepta → estado "aceptado"
6. Se genera automáticamente: rider técnico + hoja de ruta
7. Se crea entrada en contabilidad (estado "pendiente")
8. El evento aparece en el calendario
9. Cuando se cobra → "cobrado" en contabilidad
```

---

## Tarifas base (editables desde /admin/tarifas)

| Concepto | Precio |
|---|---|
| Dúo | 1.200 € |
| Trío | 1.800 € |
| Banda | 2.400 € |
| Técnico de sonido propio | 350 € |
| Técnico de luces propio | 300 € |
| Equipo técnico completo (PA) | 800 € |
| Proyección de visuales | 500 € |
| Desplazamiento | 0,30 €/km (primeros 50 km gratis) |
| Hospedaje | 60 €/persona/noche |
| Dietas | 25 €/persona/día |

---

## Enlace para la web de Wix

El formulario `/contratar` es **completamente público**, sin login ni restricciones.

Una vez desplegada la app en producción, el enlace directo para poner en la web de Wix es:

```
https://app.altillomusica.com/contratar
```

### Opciones para integrarlo en Wix

**Opción A — Botón que abre en nueva pestaña** *(recomendado)*
En Wix, añade un botón con el texto "Solicitar contratación" y configura el enlace como URL externa apuntando a `https://app.altillomusica.com/contratar`.

**Opción B — Iframe incrustado en la página de Wix**
En Wix, añade un elemento HTML/iframe y pega este código:

```html
<iframe
  src="https://app.altillomusica.com/contratar"
  width="100%"
  height="950"
  frameborder="0"
  style="border-radius: 12px; display: block;"
  title="Solicitud de contratación Altillo"
></iframe>
```

> Para que el iframe funcione hay que asegurarse de que el servidor permite iframes (añadir cabecera `X-Frame-Options: ALLOWALL` o eliminarla en next.config.mjs).

---

## Despliegue en producción

### Railway *(recomendado para este proyecto)*

1. Crear cuenta en [railway.app](https://railway.app)
2. Crear nuevo proyecto → conectar repositorio de GitHub
3. Railway detecta Next.js automáticamente y despliega
4. En Settings → Domains → añadir dominio personalizado
5. En Wix → Panel de dominio → apuntar subdominio `app` al servidor de Railway

### Render *(alternativa gratuita)*

1. Crear cuenta en [render.com](https://render.com)
2. New Web Service → conectar repo
3. Build command: `npm install && npm run build`
4. Start command: `npm start`

> ⚠️ **Vercel no es ideal** para este proyecto porque sql.js con WASM tiene problemas en la generación estática. Railway o Render funcionan mejor.

---

## Identidad visual

| Variable | Valor |
|---|---|
| Fondo base | `#0A0A0A` |
| Rojo principal | `#E23030` |
| Dorado ornamental | `#C5A55A` |
| Tipografía títulos | Oswald (Google Fonts) |
| Tipografía cuerpo | DM Sans (Google Fonts) |
| Foto de fondo | `public/bg.jpg` (Club Altillo) |

---

## Redes sociales

- Instagram: [@altillomusic](https://www.instagram.com/altillomusic/)
- Tidal: [altillo en Tidal](https://tidal.com/artist/42996330)
- YouTube: [Canal de Altillo](https://www.youtube.com/channel/UCUPfdS8AhfqtHSKqLbsm5ug)

---

## Archivos clave

```
altillo-app/
├── app/
│   ├── page.tsx                    ← Portada pública
│   ├── contratar/page.tsx          ← Formulario de contratación (público)
│   ├── admin/                      ← Panel privado (acceso por URL)
│   └── api/                        ← Endpoints REST
├── components/
│   └── NavBar.tsx                  ← Navegación (cambia según ruta pública/admin)
├── lib/
│   ├── db.ts                       ← Conexión SQLite + init tablas
│   └── logic.ts                    ← Cálculo presupuestos, riders, hojas de ruta
├── data/
│   └── altillo.db                  ← Base de datos ⚠️ no subir a repositorio público
├── public/
│   ├── bg.jpg                      ← Foto de fondo
│   └── manifest.json               ← Configuración PWA
└── app/globals.css                 ← Tema visual completo
```

---

## Próximos pasos sugeridos

- [ ] Añadir autenticación al panel `/admin` (contraseña simple o magic link)
- [ ] Integrar envío de emails automático al recibir solicitud (Resend o Nodemailer)
- [ ] Migrar base de datos a PostgreSQL/Supabase cuando haya más volumen
- [ ] Configurar dominio `app.altillomusica.com` apuntando al servidor de producción

---

*Desarrollado con Claude Code · Altillo Música 2026*
