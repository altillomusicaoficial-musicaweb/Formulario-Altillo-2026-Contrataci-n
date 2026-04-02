"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Link from "next/link";

const estadoBadge: Record<string, string> = {
  aceptado: "badge-aceptado",
  en_revision: "badge-en_revision",
  nueva: "badge-nueva",
  presupuesto_enviado: "badge-presupuesto_enviado",
  rechazado: "badge-rechazado"
};

export default function CalendarioPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/solicitudes").then((r) => r.json()).then(setSolicitudes);
  }, []);

  const hoy = new Date().toISOString().slice(0, 10);

  const eventos = solicitudes
    .map((s) => ({
      id: s.id,
      title: s.nombre_evento,
      date: s.fecha_evento,
      hora: s.hora_evento,
      estado: s.estado,
      location: `${s.nombre_espacio}, ${s.ciudad}`,
      formato: s.formato,
      pasado: s.fecha_evento < hoy
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const proximos = eventos.filter((e) => !e.pasado);
  const pasados  = eventos.filter((e) => e.pasado);

  return (
    <main>
      <NavBar />
      <div className="container py-8" style={{ maxWidth: 900 }}>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title">Calendario</h1>
            <p className="page-subtitle">Todos los eventos ordenados por fecha.</p>
          </div>
          <Link href="/admin" className="btn-ghost">← Admin</Link>
        </div>

        {eventos.length === 0 && (
          <div className="card text-center py-16 text-white/30 text-sm">No hay eventos.</div>
        )}

        {proximos.length > 0 && (
          <section className="mb-8">
            <p className="form-section-title mb-4">Próximos eventos</p>
            <div className="space-y-3">
              {proximos.map((event) => (
                <Link key={event.id} href={`/admin/solicitud/${event.id}`} className="card-inner flex items-center gap-5 no-underline group"
                  style={{ display: "flex", transition: "border-color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(226,48,48,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                >
                  {/* Date block */}
                  <div className="text-center shrink-0" style={{ minWidth: 56 }}>
                    <p className="font-heading text-2xl font-bold text-altillo-accent leading-none">
                      {event.date.slice(8, 10)}
                    </p>
                    <p className="text-xs text-white/40 uppercase tracking-wider">
                      {new Date(event.date + "T00:00:00").toLocaleDateString("es-ES", { month: "short" })}
                    </p>
                    <p className="text-xs text-white/30">{event.date.slice(0, 4)}</p>
                  </div>

                  <div className="w-px self-stretch" style={{ background: "rgba(255,255,255,0.07)" }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-medium text-white">{event.title}</p>
                      <span className={`badge ${estadoBadge[event.estado] || "badge-rechazado"}`}>{event.estado}</span>
                    </div>
                    <p className="text-sm text-white/45 mt-0.5">{event.location}</p>
                    {event.formato && (
                      <p className="text-xs text-altillo-oro mt-1 capitalize">{event.formato}{event.hora ? ` · ${event.hora}` : ""}</p>
                    )}
                  </div>

                  <span className="text-white/25 text-sm group-hover:text-altillo-accent transition-colors">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {pasados.length > 0 && (
          <section>
            <p className="form-section-title mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>Eventos pasados</p>
            <div className="space-y-2">
              {pasados.reverse().map((event) => (
                <Link key={event.id} href={`/admin/solicitud/${event.id}`}
                  className="card-inner flex items-center gap-4 no-underline"
                  style={{ display: "flex", opacity: 0.55 }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
                >
                  <div className="shrink-0" style={{ minWidth: 56 }}>
                    <p className="text-xs text-white/50">{event.date}</p>
                  </div>
                  <p className="flex-1 text-sm text-white/70">{event.title}</p>
                  <p className="text-xs text-white/35">{event.location}</p>
                  <span className={`badge ${estadoBadge[event.estado] || "badge-rechazado"}`}>{event.estado}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
