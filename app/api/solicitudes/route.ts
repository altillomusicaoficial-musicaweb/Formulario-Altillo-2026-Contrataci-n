import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { calcularPresupuesto } from "@/lib/logic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const estado = url.searchParams.get("estado");

  const db = await getDb();
  let stmt;

  if (estado) {
    stmt = db.prepare("SELECT * FROM solicitudes WHERE estado = ? ORDER BY created_at DESC");
    return NextResponse.json(stmt.all(estado));
  }

  stmt = db.prepare("SELECT * FROM solicitudes ORDER BY created_at DESC");
  return NextResponse.json(stmt.all());
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.nombre_programador || !body.email || !body.nombre_evento || !body.fecha_evento || !body.hora_evento || !body.nombre_espacio || !body.ciudad || !body.direccion_espacio) {
    return NextResponse.json({ message: "Campos obligatorios incompletos" }, { status: 400 });
  }

  const distancia = Number(body.distancia_madrid_km || 0);
  const db = await getDb();
  const stmt = db.prepare(`INSERT INTO solicitudes (
      nombre_programador, email, telefono, nombre_evento, fecha_evento, hora_evento,
      nombre_espacio, ciudad, direccion_espacio, distancia_madrid_km, tipo_solicitud,
      formato, incluye_visuales, incluye_tecnico_sonido, incluye_tecnico_luces,
      incluye_equipo_tecnico_completo, presupuesto_disponible, hospedaje_incluido,
      hospedaje_cerca_venue, num_habitaciones, catering_incluido, parking_disponible,
      notas_adicionales
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    body.nombre_programador,
    body.email,
    body.telefono || null,
    body.nombre_evento,
    body.fecha_evento,
    body.hora_evento,
    body.nombre_espacio,
    body.ciudad,
    body.direccion_espacio,
    distancia,
    body.tipo_solicitud,
    body.formato || null,
    body.incluye_visuales ? 1 : 0,
    body.incluye_tecnico_sonido ? 1 : 0,
    body.incluye_tecnico_luces ? 1 : 0,
    body.incluye_equipo_tecnico_completo ? 1 : 0,
    body.presupuesto_disponible ? Number(body.presupuesto_disponible) : null,
    body.hospedaje_incluido ? 1 : 0,
    body.hospedaje_cerca_venue ? 1 : 0,
    body.num_habitaciones || null,
    body.catering_incluido ? 1 : 0,
    body.parking_disponible ? 1 : 0,
    body.notas_adicionales || null
  );

  const created = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(result.lastInsertRowid);

  // Generar presupuesto automático para administración
  const presupuesto = await calcularPresupuesto({
    tipo_solicitud: body.tipo_solicitud,
    formato: body.formato,
    incluye_tecnico_sonido: body.incluye_tecnico_sonido,
    incluye_tecnico_luces: body.incluye_tecnico_luces,
    incluye_equipo_tecnico_completo: body.incluye_equipo_tecnico_completo,
    incluye_visuales: body.incluye_visuales,
    distancia_madrid_km: distancia,
    hospedaje_incluido: body.hospedaje_incluido,
    num_habitaciones: body.num_habitaciones,
    presupuesto_disponible: body.presupuesto_disponible
  });

  if (body.tipo_solicitud === "presupuesto_cerrado" && presupuesto.formato) {
    db.prepare("UPDATE solicitudes SET formato = ? WHERE id = ?").run(presupuesto.formato, created.id);
    created.formato = presupuesto.formato;
  }

  const stmtPresu = db.prepare(`INSERT INTO presupuestos (
      solicitud_id, cache_formato, coste_tecnico_sonido, coste_tecnico_luces,
      coste_equipo_tecnico, coste_visuales, coste_desplazamiento, coste_hospedaje,
      coste_dietas, total, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmtPresu.run(
    created.id,
    presupuesto.cache_formato,
    presupuesto.coste_tecnico_sonido,
    presupuesto.coste_tecnico_luces,
    presupuesto.coste_equipo_tecnico,
    presupuesto.coste_visuales,
    presupuesto.coste_desplazamiento,
    presupuesto.coste_hospedaje,
    presupuesto.coste_dietas,
    presupuesto.total,
    "borrador"
  );

  return NextResponse.json({ message: "¡Gracias! Tu solicitud ha sido recibida. En un máximo de 24 horas recibirás un desglose detallado por email.", solicitud: created }, { status: 201 });
}
