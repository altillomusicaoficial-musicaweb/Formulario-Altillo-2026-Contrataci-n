"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Link from "next/link";

const pagoColor: Record<string, string> = {
  pendiente: "badge-nueva",
  facturado: "badge-en_revision",
  cobrado: "badge-aceptado"
};

export default function FinanzasPage() {
  const [registros, setRegistros] = useState<any[]>([]);

  const fetchData = async () => {
    const res = await fetch("/api/finanzas");
    const data = await res.json();
    setRegistros(data);
  };

  useEffect(() => { fetchData(); }, []);

  const update = async (id: number, estado_pago: string) => {
    await fetch("/api/finanzas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, estado_pago })
    });
    fetchData();
  };

  const totalPendiente = registros.filter((r) => r.estado_pago === "pendiente").reduce((acc, r) => acc + Number(r.importe_total || 0), 0);
  const totalFacturado = registros.filter((r) => r.estado_pago === "facturado").reduce((acc, r) => acc + Number(r.importe_total || 0), 0);
  const totalCobrado  = registros.filter((r) => r.estado_pago === "cobrado").reduce((acc, r) => acc + Number(r.importe_total || 0), 0);

  return (
    <main>
      <NavBar />
      <div className="container py-8">

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title">Contabilidad interna</h1>
            <p className="page-subtitle">Control de facturas y cobros de todos los eventos.</p>
          </div>
          <Link href="/admin" className="btn-ghost">← Admin</Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pendiente", value: totalPendiente, color: "#ff7070" },
            { label: "Facturado", value: totalFacturado, color: "#ffd76e" },
            { label: "Cobrado",   value: totalCobrado,   color: "#7ccb5d" }
          ].map((item) => (
            <div key={item.label} className="card-inner">
              <p className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Oswald, sans-serif", color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em" }}>
                {item.label}
              </p>
              <p className="font-heading text-2xl font-bold" style={{ color: item.color }}>
                {item.value.toFixed(2)} €
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {registros.length === 0 ? (
            <div className="py-16 text-center text-white/30 text-sm">No hay registros de finanzas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Fecha evento</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r) => (
                    <tr key={r.id}>
                      <td className="font-medium">{r.nombre_evento || "—"}</td>
                      <td style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem" }}>{r.fecha_evento || "—"}</td>
                      <td>
                        <span className="font-heading text-lg" style={{ color: "#C5A55A" }}>
                          {Number(r.importe_total || 0).toFixed(2)} €
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${pagoColor[r.estado_pago] || "badge-rechazado"}`}>
                          {r.estado_pago}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {r.estado_pago !== "facturado" && r.estado_pago !== "cobrado" && (
                            <button className="btn-red" style={{ padding: "0.4rem 0.9rem", fontSize: "0.75rem" }} onClick={() => update(r.id, "facturado")}>
                              Facturar
                            </button>
                          )}
                          {r.estado_pago !== "cobrado" && (
                            <button className="btn-red" style={{ padding: "0.4rem 0.9rem", fontSize: "0.75rem", background: "#3a7d44" }} onClick={() => update(r.id, "cobrado")}>
                              Cobrado
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
