"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";

const estadoColor: Record<string, string> = {
  nueva: "badge-nueva",
  en_revision: "badge-en_revision",
  presupuesto_enviado: "badge-presupuesto_enviado",
  aceptado: "badge-aceptado",
  rechazado: "badge-rechazado"
};

const estadoLabel: Record<string, string> = {
  nueva: "Nueva",
  en_revision: "En revisión",
  presupuesto_enviado: "Ppto. enviado",
  aceptado: "Aceptado",
  rechazado: "Rechazado"
};

function PdfDot({ generated, label }: { generated: boolean; label: string }) {
  return (
    <span
      title={generated ? `${label} generado` : `${label} pendiente`}
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: generated ? "#7ccb5d" : "rgba(255,255,255,0.15)",
        border: generated ? "none" : "1px solid rgba(255,255,255,0.2)",
        marginRight: 3,
        flexShrink: 0,
      }}
    />
  );
}

export default function AdminPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [estadoFilter, setEstadoFilter] = useState<string>("");

  const fetchSolicitudes = async () => {
    const url = estadoFilter ? `/api/solicitudes?estado=${estadoFilter}` : "/api/solicitudes";
    const res = await fetch(url);
    const data = await res.json();
    setSolicitudes(data);
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [estadoFilter]);

  return (
    <main>
      <NavBar />
      <div className="container py-8">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title">Panel Admin</h1>
            <p className="page-subtitle">Solicitudes de contratación · genera presupuestos, riders y fichas en un clic.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/tarifas" className="btn-ghost">Tarifas</Link>
            <Link href="/admin/finanzas" className="btn-ghost">Contabilidad</Link>
            <Link href="/admin/calendario" className="btn-ghost">Calendario</Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-xs uppercase tracking-widest text-white/40" style={{ fontFamily: "Oswald, sans-serif" }}>Estado</span>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "", label: "Todas" },
              { value: "nueva", label: "Nueva" },
              { value: "en_revision", label: "En revisión" },
              { value: "presupuesto_enviado", label: "Ppto. enviado" },
              { value: "aceptado", label: "Aceptado" },
              { value: "rechazado", label: "Rechazado" }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEstadoFilter(opt.value)}
                className="text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border transition-colors"
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  borderColor: estadoFilter === opt.value ? "#E23030" : "rgba(255,255,255,0.12)",
                  color: estadoFilter === opt.value ? "#E23030" : "rgba(255,255,255,0.55)",
                  background: estadoFilter === opt.value ? "rgba(226,48,48,0.1)" : "transparent",
                  fontSize: "0.7rem"
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* PDF legend */}
          <div className="ml-auto flex items-center gap-3 text-xs text-white/30" style={{ fontFamily: "DM Sans, sans-serif" }}>
            <span className="flex items-center gap-1">
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#7ccb5d" }} />
              PDF generado
            </span>
            <span className="flex items-center gap-1">
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }} />
              Pendiente
            </span>
            <span className="opacity-60">P = Presupuesto · R = Rider · F = Ficha</span>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {solicitudes.length === 0 ? (
            <div className="py-16 text-center text-white/30 text-sm">No hay solicitudes.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Creada</th>
                    <th>Programador</th>
                    <th>Evento</th>
                    <th>Fecha evento</th>
                    <th>Ciudad</th>
                    <th>Formato</th>
                    <th>Estado</th>
                    <th title="PDFs generados: Presupuesto · Rider · Ficha">PDFs</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => (
                    <tr key={s.id}>
                      <td style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {new Date(s.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                      <td>
                        <div className="font-medium">{s.nombre_programador}</div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{s.email}</div>
                      </td>
                      <td className="font-medium">{s.nombre_evento}</td>
                      <td style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>{s.fecha_evento}</td>
                      <td style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem" }}>{s.ciudad}</td>
                      <td style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", textTransform: "capitalize" }}>
                        {s.formato
                          ? s.formato
                          : s.tipo_solicitud === "presupuesto_cerrado"
                          ? <span style={{ color: "#C5A55A", fontSize: "0.75rem" }}>€{s.presupuesto_disponible}</span>
                          : "—"}
                      </td>
                      <td>
                        <span className={`badge ${estadoColor[s.estado] || "badge-rechazado"}`}>
                          {estadoLabel[s.estado] || s.estado}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-0.5" style={{ minWidth: 48 }}>
                          <PdfDot generated={!!s.pdf_presupuesto_at} label="Presupuesto" />
                          <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", marginRight: 4 }}>P</span>
                          <PdfDot generated={!!s.pdf_rider_at} label="Rider" />
                          <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", marginRight: 4 }}>R</span>
                          <PdfDot generated={!!s.pdf_ficha_at} label="Ficha" />
                          <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)" }}>F</span>
                        </div>
                      </td>
                      <td>
                        <Link
                          href={`/admin/solicitud/${s.id}`}
                          className="text-xs font-bold uppercase tracking-wider text-altillo-accent hover:underline"
                          style={{ fontFamily: "Oswald, sans-serif", letterSpacing: "0.1em" }}
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {solicitudes.length > 0 && (
          <p className="mt-3 text-right text-xs text-white/30">{solicitudes.length} solicitud{solicitudes.length !== 1 ? "es" : ""}</p>
        )}
      </div>
    </main>
  );
}
