import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generarRider, calcularHojaRuta } from "@/lib/logic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const db = await getDb();
  const presupuesto = db.prepare("SELECT * FROM presupuestos WHERE id = ?").get(params.id);
  if (!presupuesto) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  const solicitud = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(presupuesto.solicitud_id);
  const rider = db.prepare("SELECT * FROM riders WHERE presupuesto_id = ? ORDER BY created_at DESC LIMIT 1").get(params.id);
  const hojaRuta = solicitud ? calcularHojaRuta(solicitud, presupuesto) : null;

  return NextResponse.json({ presupuesto, solicitud, rider, hojaRuta });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const data = await request.json();
  const db = await getDb();

  const presupuesto = db.prepare("SELECT * FROM presupuestos WHERE id = ?").get(params.id);
  if (!presupuesto) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  if (data.action === "send") {
    db.prepare("UPDATE presupuestos SET estado = 'presupuesto_enviado', enviado_at = datetime('now'), notas = ? WHERE id = ?").run(data.notas || null, params.id);
    const solicitud = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(presupuesto.solicitud_id);
    if (solicitud) {
      db.prepare("UPDATE solicitudes SET estado = 'en_revision' WHERE id = ?").run(solicitud.id);
    }
    return NextResponse.json({ message: "Presupuesto enviado" });
  }

  if (data.action === "accept") {
    db.prepare("UPDATE presupuestos SET estado = 'aceptado', aceptado_at = datetime('now') WHERE id = ?").run(params.id);
    db.prepare("UPDATE solicitudes SET estado = 'aceptado' WHERE id = ?").run(presupuesto.solicitud_id);
    db.prepare("INSERT INTO finanzas (presupuesto_id, fecha_evento, importe_total, estado_pago) VALUES (?, ?, ?, 'pendiente')").run(presupuesto.id, data.fecha_evento || null, presupuesto.total);
    return NextResponse.json({ message: "Presupuesto aceptado y finanza creada" });
  }

  if (data.action === "rider") {
    const solicitud = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(presupuesto.solicitud_id);
    const riderData = generarRider(solicitud.formato, solicitud);
    db.prepare(`INSERT INTO riders (presupuesto_id, formato, contenido_rider, incluye_tecnico_sonido, incluye_tecnico_luces, incluye_visuales) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(params.id, solicitud.formato, JSON.stringify(riderData), solicitud.incluye_tecnico_sonido, solicitud.incluye_tecnico_luces, solicitud.incluye_visuales);
    return NextResponse.json({ message: "Rider generado", rider: riderData });
  }

  return NextResponse.json({ message: "Accion no reconocida" }, { status: 400 });
}
