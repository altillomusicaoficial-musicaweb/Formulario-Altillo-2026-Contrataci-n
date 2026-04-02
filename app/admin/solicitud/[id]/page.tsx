"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { calcularHojaRuta } from "@/lib/logic";

const estadoColor: Record<string, string> = {
  nueva: "badge-nueva",
  en_revision: "badge-en_revision",
  presupuesto_enviado: "badge-presupuesto_enviado",
  aceptado: "badge-aceptado",
  rechazado: "badge-rechazado"
};

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

function CardSection({ title, accent, children }: { title: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="card-inner">
      <p className="form-section-title" style={accent ? { color: accent } : {}}>{title}</p>
      {children}
    </div>
  );
}

export default function SolicitudDetalle() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [observaciones, setObservaciones] = useState("");

  const load = async () => {
    const res = await fetch(`/api/solicitudes/${params.id}`);
    const json = await res.json();
    setData(json);
  };

  useEffect(() => { load(); }, [params.id]);

  if (!data) {
    return (
      <main>
        <NavBar />
        <div className="container py-10 text-white/40 text-sm">Cargando…</div>
      </main>
    );
  }

  const { solicitud, presupuesto, rider, hojaRuta } = data;
  const presupuestoId = presupuesto?.id;
  const equipoViaja = hojaRuta?.equipo_que_viaja || hojaRuta?.equipo_viaja || [];

  const actualizarEstado = async (estado: string) => {
    await fetch(`/api/solicitudes/${params.id}`, {
      method: "PUT",
      body: JSON.stringify({ estado, notas_internas: observaciones }),
      headers: { "Content-Type": "application/json" }
    });
    load();
  };

  const ejecutarPresupuesto = async (accion: string) => {
    if (!presupuestoId) return;
    await fetch(`/api/presupuestos/${presupuestoId}`, {
      method: "PATCH",
      body: JSON.stringify({ action: accion, fecha_evento: solicitud.fecha_evento }),
      headers: { "Content-Type": "application/json" }
    });
    load();
  };

  const riderData = rider ? JSON.parse(rider.contenido_rider) : null;

  return (
    <main>
      <NavBar />
      <div className="container py-8" style={{ maxWidth: 1000 }}>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button className="btn-ghost text-sm" onClick={() => router.push("/admin")}>← Volver</button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="page-title" style={{ fontSize: "1.5rem" }}>
                {solicitud.nombre_evento}
              </h1>
              <span className={`badge ${estadoColor[solicitud.estado] || "badge-rechazado"}`}>{solicitud.estado}</span>
            </div>
            <p className="page-subtitle">Solicitud #{solicitud.id} · {solicitud.fecha_evento}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Programador */}
          <CardSection title="Datos del programador">
            <DetailRow label="Nombre" value={solicitud.nombre_programador} />
            <DetailRow label="Email" value={solicitud.email} />
            <DetailRow label="Teléfono" value={solicitud.telefono} />
            <DetailRow label="Ciudad" value={solicitud.ciudad} />
          </CardSection>

          {/* Evento */}
          <CardSection title="Detalles del evento" accent="#C5A55A">
            <DetailRow label="Evento" value={solicitud.nombre_evento} />
            <DetailRow label="Espacio" value={solicitud.nombre_espacio} />
            <DetailRow label="Fecha y hora" value={`${solicitud.fecha_evento} · ${solicitud.hora_evento}`} />
            <DetailRow label="Dirección" value={solicitud.direccion_espacio} />
            <DetailRow label="Distancia Madrid" value={`${solicitud.distancia_madrid_km} km`} />
            <DetailRow label="Formato" value={solicitud.formato} />
          </CardSection>

          {/* Presupuesto */}
          {presupuesto && (
            <CardSection title="Presupuesto calculado">
              {[
                ["Caché formato", presupuesto.cache_formato],
                ["Técnico sonido", presupuesto.coste_tecnico_sonido],
                ["Técnico luces", presupuesto.coste_tecnico_luces],
                ["Visuales", presupuesto.coste_visuales],
                ["Equipo técnico", presupuesto.coste_equipo_tecnico],
                ["Desplazamiento", presupuesto.coste_desplazamiento],
                ["Hospedaje", presupuesto.coste_hospedaje],
                ["Dietas", presupuesto.coste_dietas]
              ].filter(([, v]) => Number(v) > 0).map(([label, val]) => (
                <div key={label as string} className="budget-row">
                  <span>{label as string}</span>
                  <span className="budget-amount">{Number(val).toFixed(2)} €</span>
                </div>
              ))}
              <div className="budget-row total">
                <span>TOTAL</span>
                <span className="budget-amount">{Number(presupuesto.total).toFixed(2)} €</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-red" onClick={() => ejecutarPresupuesto("send")}>Enviar presupuesto</button>
                <button className="btn-ghost" onClick={() => ejecutarPresupuesto("accept")}>Aceptar y crear finanza</button>
              </div>
            </CardSection>
          )}

          {/* Rider */}
          <CardSection title="Rider técnico">
            <button className="btn-ghost mb-4" onClick={() => ejecutarPresupuesto("rider")}>
              {rider ? "Actualizar rider" : "Generar rider"}
            </button>
            {riderData && (
              <div>
                <p className="font-heading text-white text-base mb-1">{riderData.nombre}</p>
                <p className="text-xs text-white/40 mb-3">{riderData.escenario_minimo} · {riderData.sonido_minimo}</p>
                <ul className="space-y-1.5">
                  {riderData.necesidades.map((item: string, ix: number) => (
                    <li key={ix} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-altillo-oro mt-0.5">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
                {riderData.nota && (
                  <p className="mt-3 text-xs text-white/35 italic">{riderData.nota}</p>
                )}
              </div>
            )}
          </CardSection>

          {/* Hoja de ruta */}
          {hojaRuta && (
            <CardSection title="Hoja de ruta" accent="#C5A55A">
              <DetailRow label="Lugar" value={hojaRuta.lugar} />
              <DetailRow label="Formato" value={hojaRuta.formato} />
              <DetailRow label="Distancia" value={hojaRuta.distancia} />
              <DetailRow label="Hora de salida" value={hojaRuta.hora_salida_estimada} />
              <DetailRow label="Prueba de sonido" value={hojaRuta.hora_prueba_sonido} />
              <DetailRow label="Show" value={hojaRuta.hora_show} />
              <DetailRow label="Equipo que viaja" value={Array.isArray(equipoViaja) ? equipoViaja.join(", ") : equipoViaja} />
              <DetailRow label="Técnicos" value={hojaRuta.tecnicos} />
              <DetailRow label="Hospedaje" value={hojaRuta.hospedaje} />
              <DetailRow label="Contacto" value={hojaRuta.contacto_programador} />
            </CardSection>
          )}

          {/* Gestión de estado */}
          <div className="lg:col-span-2">
            <CardSection title="Gestión de estado">
              <div className="mb-4">
                <span className="text-xs text-white/40 uppercase tracking-widest" style={{ fontFamily: "Oswald, sans-serif" }}>Notas internas</span>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  placeholder="Observaciones privadas del equipo…"
                  className="form-input mt-2"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="btn-red" onClick={() => actualizarEstado("en_revision")}>En revisión</button>
                <button className="btn-red" onClick={() => actualizarEstado("aceptado")}>Aceptado</button>
                <button className="btn-ghost" onClick={() => actualizarEstado("rechazado")}>Rechazado</button>
              </div>
            </CardSection>
          </div>

        </div>
      </div>
    </main>
  );
}
