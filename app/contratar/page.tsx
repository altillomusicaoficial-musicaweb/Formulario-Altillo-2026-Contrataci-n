"use client";

import { type ChangeEvent, type ReactNode, FormEvent, useState } from "react";
import NavBar from "@/components/NavBar";

const formatos = [
  { value: "duo",      label: "Dúo" },
  { value: "trio",     label: "Trío" },
  { value: "banda",    label: "Banda" },
  { value: "cuarteto", label: "Cuarteto" },
  { value: "quinteto", label: "Quinteto" },
];

const CIUDADES = [
  "A Coruña", "Albacete", "Alicante", "Almería", "Ávila", "Badajoz",
  "Barcelona", "Bilbao", "Burgos", "Cáceres", "Cádiz", "Castellón de la Plana",
  "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara",
  "Huelva", "Huesca", "Jaén", "Las Palmas de Gran Canaria", "León", "Lleida",
  "Logroño", "Lugo", "Madrid", "Málaga", "Murcia", "Ourense", "Oviedo",
  "Palencia", "Palma de Mallorca", "Pamplona", "Pontevedra", "Salamanca",
  "San Sebastián", "Santa Cruz de Tenerife", "Santander", "Santiago de Compostela",
  "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia",
  "Valladolid", "Vitoria-Gasteiz", "Zamora", "Zaragoza", "Fuera de España"
];

const INPUT = "form-input mt-2";

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="form-section-title">{children}</p>;
}

function SectionNote({ children }: { children: ReactNode }) {
  return (
    <p style={{
      fontSize: "0.92rem",
      color: "rgba(255,255,255,0.82)",
      lineHeight: 1.75,
      marginBottom: "1.25rem",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      padding: "0.85rem 1rem",
    }}>
      {children}
    </p>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block font-semibold text-white/90" style={{ fontSize: "1rem", marginBottom: "0.3rem" }}>
        {label}{required && <span className="text-altillo-accent ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

const EMPTY_FORM = {
  nombre_programador: "",
  email: "",
  telefono: "",
  nombre_evento: "",
  fecha_evento: "",
  hora_evento: "",
  nombre_espacio: "",
  ciudad: "",
  direccion_espacio: "",
  tipo_solicitud: "elegir_formato",
  formato: "duo",
  incluye_visuales: false,
  incluye_tecnico_sonido: false,
  incluye_tecnico_luces: false,
  incluye_equipo_tecnico_completo: false,
  presupuesto_disponible: 0,
  hospedaje_incluido: false,
  hospedaje_cerca_venue: false,
  num_habitaciones: 0,
  catering_incluido: false,
  parking_disponible: false,
  notas_adicionales: ""
};

export default function ContratarPage() {
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [fechaPorDeterminar, setFechaPorDeterminar] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const toggleFechaPorDeterminar = () => {
    setFechaPorDeterminar((prev) => {
      const next = !prev;
      setForm((f: any) => ({ ...f, fecha_evento: next ? "por_determinar" : "" }));
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);
    setError(null);
    try {
      const payload = { ...form };
      if (fechaPorDeterminar) payload.fecha_evento = "por_determinar";
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error en la solicitud");
      setMensaje("¡Gracias! Tu solicitud ha sido recibida. En un máximo de 24 horas recibirás un desglose detallado por email.");
      setForm(EMPTY_FORM);
      setFechaPorDeterminar(false);
    } catch (err: any) {
      setError(err.message || "Fallo en la creación");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main>
      <NavBar />

      {/* Hero */}
      <div
        className="text-center"
        style={{ padding: "6rem 1.5rem 3rem", background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(226,48,48,0.13) 0%, transparent 70%)" }}
      >
        <p className="text-altillo-oro uppercase tracking-widest mb-4" style={{ fontSize: "0.62rem", letterSpacing: "0.35em" }}>
          Altillo Música · Contratación
        </p>
        <h1
          className="font-heading font-black uppercase text-altillo-accent"
          style={{ fontSize: "clamp(2.8rem, 8vw, 5.5rem)", letterSpacing: "0.06em", lineHeight: 1, textShadow: "0 0 60px rgba(226,48,48,0.25)" }}
        >
          Solicitud de<br />Contratación
        </h1>
        <div className="mx-auto mt-5 mb-5" style={{ height: 2, width: 80, background: "linear-gradient(90deg, transparent, #E23030, transparent)" }} />
        <p className="mx-auto" style={{ fontSize: "0.95rem", maxWidth: 640, lineHeight: 1.85, color: "rgba(255,255,255,0.92)", background: "rgba(8,3,3,0.72)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "1.25rem 1.5rem" }}>
          ¡Hola! Muchas gracias por tu interés en el proyecto. Este formulario está pensado para facilitarte la contratación de Altillo y que podamos organizar el evento adaptándonos a tus posibilidades y a las nuestras. Además, aquí podrás descubrir y añadir otros servicios extra si lo deseas, como: taller de música para peques, taller de expresión corporal con música en directo, etc.
        </p>
      </div>

      <div className="container-form" style={{ paddingTop: "1rem" }}>
        <div className="mb-6" />

        {mensaje && (
          <div className="mb-6 card" style={{ borderColor: "rgba(124,203,93,0.3)", background: "rgba(124,203,93,0.08)", padding: "1rem 1.25rem" }}>
            <p className="text-sm" style={{ color: "#7ccb5d" }}>{mensaje}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 card" style={{ borderColor: "rgba(226,48,48,0.3)", background: "rgba(226,48,48,0.08)", padding: "1rem 1.25rem" }}>
            <p className="text-sm text-altillo-accent">{error}</p>
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-0">

            {/* ── Sección 1: Datos de contacto ── */}
            <div className="form-section">
              <SectionTitle>Datos de contacto</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre" required>
                  <input className={INPUT} name="nombre_programador" value={form.nombre_programador} onChange={handleChange} required placeholder="Tu nombre completo" />
                </Field>
                <Field label="Email" required>
                  <input className={INPUT} type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@ejemplo.com" />
                </Field>
                <Field label="Teléfono">
                  <input className={INPUT} name="telefono" value={form.telefono} onChange={handleChange} placeholder="+34 600 000 000" />
                </Field>
              </div>
            </div>

            {/* ── Sección 2: Datos del evento ── */}
            <div className="form-section">
              <SectionTitle>Datos del evento</SectionTitle>
              <SectionNote>
                Escribe aquí cuándo tienes pensado que pudiera ser el evento. Si no lo tuvieras del todo cerrado, marca la casilla &ldquo;Por determinar&rdquo;.
              </SectionNote>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre del evento" required>
                  <input className={INPUT} name="nombre_evento" value={form.nombre_evento} onChange={handleChange} required placeholder="Nombre del concierto o evento" />
                </Field>

                {/* Fecha con toggle Por determinar */}
                <div>
                  <span className="block text-sm font-medium text-white/70 mb-2">
                    Fecha del evento{!fechaPorDeterminar && <span className="text-altillo-accent ml-1">*</span>}
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      className={INPUT}
                      type="date"
                      name="fecha_evento"
                      value={fechaPorDeterminar ? "" : form.fecha_evento}
                      onChange={handleChange}
                      required={!fechaPorDeterminar}
                      disabled={fechaPorDeterminar}
                      style={{ flex: 1, opacity: fechaPorDeterminar ? 0.35 : 1 }}
                    />
                    <button
                      type="button"
                      onClick={toggleFechaPorDeterminar}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "0.6rem 0.9rem",
                        borderRadius: "8px",
                        border: `1px solid ${fechaPorDeterminar ? "#E23030" : "rgba(255,255,255,0.15)"}`,
                        background: fechaPorDeterminar ? "rgba(226,48,48,0.15)" : "transparent",
                        color: fechaPorDeterminar ? "#E23030" : "rgba(255,255,255,0.5)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s",
                      }}
                    >
                      {fechaPorDeterminar ? "✓ Por det." : "Por det."}
                    </button>
                  </div>
                </div>

                <Field label="Hora del evento">
                  <input className={INPUT} type="time" name="hora_evento" value={form.hora_evento} onChange={handleChange} placeholder="20:00" />
                </Field>

                <div>
                  <span className="block text-sm font-medium text-white/70 mb-2">
                    Ciudad <span className="text-altillo-accent">*</span>
                  </span>
                  <select className={INPUT} name="ciudad" value={form.ciudad} onChange={handleChange} required>
                    <option value="">Selecciona una ciudad…</option>
                    {CIUDADES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <Field label="Nombre del espacio" required>
                  <input className={INPUT} name="nombre_espacio" value={form.nombre_espacio} onChange={handleChange} required placeholder="Sala, teatro, festival…" />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Dirección del espacio">
                    <input className={INPUT} name="direccion_espacio" value={form.direccion_espacio} onChange={handleChange} placeholder="Calle, número, código postal" />
                  </Field>
                </div>
              </div>
            </div>

            {/* ── Sección 3: Formato y extras técnicos ── */}
            <div className="form-section">
              <SectionTitle>Formato y extras técnicos</SectionTitle>
              <SectionNote>
                Aquí, si nos facilitas toda la información sobre lo que necesitas para el evento, podemos calcular mejor el presupuesto y pasarte algo más acorde a lo que buscas.
              </SectionNote>

              {/* Tipo de solicitud */}
              <div className="mb-4">
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: "0.75rem" }}>
                  <strong style={{ color: "rgba(255,255,255,0.9)" }}>Indícanos tu situación:</strong> si ya tienes un presupuesto cerrado, dinos la cantidad y te propondremos los formatos y opciones que mejor se adapten. Si, por el contrario, tu presupuesto es flexible y depende de lo que necesites del espectáculo, te dejamos algunos apartados a continuación para ayudarnos a entender mejor tu idea.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <select className={INPUT} name="tipo_solicitud" value={form.tipo_solicitud} onChange={handleChange}>
                      <option value="elegir_formato">Mi presupuesto es flexible, quiero elegir formato</option>
                      <option value="presupuesto_cerrado">Tengo un presupuesto cerrado</option>
                    </select>
                  </div>

                  {form.tipo_solicitud === "elegir_formato" ? (
                    <div className="sm:col-span-2">
                      <Field label="Formato">
                        <select className={INPUT} name="formato" value={form.formato} onChange={handleChange}>
                          {formatos.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <Field label="¿Cuál es tu presupuesto disponible? (€)">
                        <input
                          className={INPUT}
                          type="number"
                          name="presupuesto_disponible"
                          value={form.presupuesto_disponible || ""}
                          onChange={handleChange}
                          min={0}
                          placeholder="Introduce la cantidad en euros"
                        />
                      </Field>
                    </div>
                  )}
                </div>
              </div>

              {/* Extras técnicos */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem" }}>
                <p className="form-section-title" style={{ marginBottom: "0.75rem" }}>Detalles técnicos</p>
                <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, marginBottom: "1rem", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "0.75rem 1rem", border: "1px solid rgba(255,255,255,0.09)" }}>
                  Para organizar los detalles técnicos del evento, por favor indícanos lo siguiente:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <label className="checkbox-label" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
                    <input type="checkbox" className="custom-checkbox" style={{ marginTop: "2px" }} name="incluye_tecnico_sonido" checked={form.incluye_tecnico_sonido} onChange={handleChange} />
                    <span>
                      <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Personal técnico: </span>
                      <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.9rem" }}>¿Necesitas que llevemos a nuestros propios técnicos? (Solemos recomendarlo porque conocen el espectáculo a la perfección, aunque conlleva un coste extra).</span>
                    </span>
                  </label>
                  <label className="checkbox-label" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
                    <input type="checkbox" className="custom-checkbox" style={{ marginTop: "2px" }} name="incluye_visuales" checked={form.incluye_visuales} onChange={handleChange} />
                    <span>
                      <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Proyecciones: </span>
                      <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.9rem" }}>¿El espacio cuenta con una zona habilitada para proyecciones?</span>
                    </span>
                  </label>
                  <label className="checkbox-label" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
                    <input type="checkbox" className="custom-checkbox" style={{ marginTop: "2px" }} name="incluye_equipo_tecnico_completo" checked={form.incluye_equipo_tecnico_completo} onChange={handleChange} />
                    <span>
                      <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Material: </span>
                      <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.9rem" }}>¿Es necesario que aportemos nosotros el equipo técnico (altavoces, monitores, micrófonos, pies de micro, etc.)?</span>
                    </span>
                  </label>
                  <label className="checkbox-label" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
                    <input type="checkbox" className="custom-checkbox" style={{ marginTop: "2px" }} name="incluye_tecnico_luces" checked={form.incluye_tecnico_luces} onChange={handleChange} />
                    <span>
                      <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Técnico de iluminación: </span>
                      <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.9rem" }}>¿Necesitas técnico de luces propio?</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* ── Sección 4: Logística ── */}
            <div className="form-section">
              <SectionTitle>Logística</SectionTitle>
              <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, marginBottom: "1rem", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "0.75rem 1rem", border: "1px solid rgba(255,255,255,0.09)" }}>
                Por favor, coméntanos los siguientes detalles:
              </p>
              <div className="grid grid-cols-1 gap-3 mb-4">
                <label className="checkbox-label" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
                  <input type="checkbox" className="custom-checkbox" style={{ marginTop: "2px" }} name="hospedaje_incluido" checked={form.hospedaje_incluido} onChange={handleChange} />
                  <span>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Alojamiento: </span>
                    <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.9rem" }}>¿Dispones de un lugar donde podamos alojarnos?</span>
                  </span>
                </label>

                {form.hospedaje_incluido && (
                  <div style={{ marginLeft: "2rem" }}>
                    <Field label="¿Cuántas habitaciones habría disponibles?">
                      <input className={INPUT} type="number" name="num_habitaciones" value={form.num_habitaciones || ""} onChange={handleChange} min={0} placeholder="Número de habitaciones" style={{ maxWidth: 220 }} />
                    </Field>
                  </div>
                )}

                <label className="checkbox-label" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
                  <input type="checkbox" className="custom-checkbox" style={{ marginTop: "2px" }} name="hospedaje_cerca_venue" checked={form.hospedaje_cerca_venue} onChange={handleChange} />
                  <span>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Ubicación: </span>
                    <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.9rem" }}>¿El alojamiento está cerca del lugar de la actuación?</span>
                  </span>
                </label>

                <label className="checkbox-label" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
                  <input type="checkbox" className="custom-checkbox" style={{ marginTop: "2px" }} name="parking_disponible" checked={form.parking_disponible} onChange={handleChange} />
                  <span>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Aparcamiento: </span>
                    <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.9rem" }}>¿Hay zona para aparcar con facilidad?</span>
                  </span>
                </label>

                <label className="checkbox-label" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
                  <input type="checkbox" className="custom-checkbox" style={{ marginTop: "2px" }} name="catering_incluido" checked={form.catering_incluido} onChange={handleChange} />
                  <span>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Dietas: </span>
                    <span style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.9rem" }}>¿Están incluidas las comidas y/o cenas?</span>
                  </span>
                </label>
              </div>
            </div>

            {/* ── Sección 5: Datos adicionales ── */}
            <div className="form-section">
              <SectionTitle>Datos adicionales</SectionTitle>
              <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, marginBottom: "0.75rem", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "0.75rem 1rem", border: "1px solid rgba(255,255,255,0.09)" }}>
                Sabemos que cada evento tiene muchas variables. Si tienes cualquier otro detalle que comentarnos o algo que no hayamos contemplado, ¡cuéntanoslo aquí! Muchas gracias.
              </p>
              <textarea
                className="form-input"
                name="notas_adicionales"
                value={form.notas_adicionales}
                onChange={handleChange}
                rows={5}
                placeholder="Cuéntanos cualquier detalle adicional sobre tu evento…"
              />
            </div>

            {/* ── Submit ── */}
            <div className="form-section">
              <button type="submit" className="btn-red btn-red-lg" disabled={enviando}>
                {enviando ? "Enviando…" : "Enviar solicitud"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}
