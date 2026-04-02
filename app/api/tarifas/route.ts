import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const tarifas = db.prepare("SELECT * FROM tarifas ORDER BY clave").all();
  return NextResponse.json(tarifas);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.clave || typeof body.valor !== "number") {
    return NextResponse.json({ message: "Clave y valor requeridos" }, { status: 400 });
  }
  const db = await getDb();
  const res = db.prepare("UPDATE tarifas SET valor = ?, updated_at = datetime('now') WHERE clave = ?").run(body.valor, body.clave);
  if (res.changes === 0) {
    return NextResponse.json({ message: "Tarifa no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ message: "Tarifa actualizada" });
}
