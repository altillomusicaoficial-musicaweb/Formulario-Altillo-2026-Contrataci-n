import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { calcularHojaRuta } from "@/lib/logic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const db = await getDb();
  const solicitud = db.prepare("SELECT * FROM solicitudes WHERE id = ?").get(params.id);

  if (!solicitud) {
    return NextResponse.json({ message: "No encontrada" }, { status: 404 });
  }

  const presupuesto = db.prepare("SELECT * FROM presupuestos WHERE solicitud_id = ? ORDER BY created_at DESC LIMIT 1").get(params.id);
  const rider = db.prepare("SELECT * FROM riders WHERE presupuesto_id = ? ORDER BY created_at DESC LIMIT 1").get(presupuesto?.id);
  const hojaRuta = solicitud ? calcularHojaRuta(solicitud, presupuesto) : null;

  return NextResponse.json({ solicitud, presupuesto, rider, hojaRuta });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const db = await getDb();

  if (body.estado) {
    db.prepare("UPDATE solicitudes SET estado = ?, notas_internas = ? WHERE id = ?").run(body.estado, body.notas_internas || null, params.id);
    return NextResponse.json({ message: "Estado actualizado" });
  }

  if (body.pdf_generado) {
    const colMap: Record<string, string> = {
      presupuesto: "pdf_presupuesto_at",
      rider: "pdf_rider_at",
      ficha: "pdf_ficha_at",
    };
    const col = colMap[body.pdf_generado];
    if (!col) return NextResponse.json({ message: "PDF desconocido" }, { status: 400 });
    const now = new Date().toISOString();
    db.prepare(`UPDATE solicitudes SET ${col} = ? WHERE id = ?`).run(now, params.id);
    return NextResponse.json({ message: "PDF registrado" });
  }

  return NextResponse.json({ message: "Nada que actualizar" }, { status: 400 });
}
