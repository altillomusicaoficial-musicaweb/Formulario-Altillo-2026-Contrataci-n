import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const registros = db.prepare(`SELECT f.*, p.solicitud_id, p.total as total_presupuesto, s.nombre_evento FROM finanzas f LEFT JOIN presupuestos p ON f.presupuesto_id = p.id LEFT JOIN solicitudes s ON p.solicitud_id = s.id ORDER BY f.id DESC`).all();
  return NextResponse.json(registros);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id || !body.estado_pago) {
    return NextResponse.json({ message: "id y estado_pago requeridos" }, { status: 400 });
  }
  const db = await getDb();
  const res = db.prepare("UPDATE finanzas SET estado_pago = ?, fecha_factura = ?, fecha_cobro = ?, metodo_pago = ?, notas = ? WHERE id = ?").run(body.estado_pago, body.fecha_factura || null, body.fecha_cobro || null, body.metodo_pago || null, body.notas || null, body.id);
  if (res.changes === 0) {
    return NextResponse.json({ message: "No se actualizó registro" }, { status: 404 });
  }
  return NextResponse.json({ message: "Finanza actualizada" });
}
