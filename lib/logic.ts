import { getDb } from "./db";

export type Formato = "duo" | "trio" | "cuarteto" | "quinteto";

export const TARIFAS_BASE = {
  formatos: {
    duo: { precio: 1200, descripcion: "Voz + instrumento" },
    trio: { precio: 1800, descripcion: "Voz + 2 instrumentos" },
    cuarteto: { precio: 2400, descripcion: "Voz + 3 instrumentos" },
    quinteto: { precio: 3000, descripcion: "Voz + 4 instrumentos" }
  },
  tecnico_sonido: { precio: 350, descripcion: "Técnico de sonido propio" },
  tecnico_luces: { precio: 300, descripcion: "Técnico de iluminación propio" },
  equipo_tecnico_completo: { precio: 800, descripcion: "PA + mesa + microfonía + cableado" },
  visuales: { precio: 500, descripcion: "Proyección de visuales en directo" },
  desplazamiento: { precio_por_km: 0.3, km_incluidos_gratis: 50 },
  hospedaje: { precio_por_persona_noche: 60 },
  dietas: { por_persona_dia: 25 }
};

async function obtenerTarifas(): Promise<Record<string, number>> {
  const db = await getDb();
  const filas = db.prepare("SELECT clave, valor FROM tarifas").all();
  const tarifas: Record<string, number> = {};
  filas.forEach((fila: any) => {
    tarifas[fila.clave] = Number(fila.valor);
  });
  return tarifas;
}

function obtenerPrecioFormato(formato: Formato, tarifas: Record<string, number>) {
  const clave = `formato_${formato}`;
  return Number(tarifas[clave] ?? TARIFAS_BASE.formatos[formato].precio);
}

function construirPresupuestoBase(datos: any, tarifas: Record<string, number>) {
  const distancia = Number(datos.distancia_madrid_km || 0);
  const hospedajeIncluido = Boolean(datos.hospedaje_incluido);
  const num_habitaciones = Number(datos.num_habitaciones || 0);
  const dias = 1;
  const precioPorKm = Number(tarifas.desplazamiento_por_km ?? TARIFAS_BASE.desplazamiento.precio_por_km);
  const kmGratis = Number(tarifas.desplazamiento_km_gratis ?? TARIFAS_BASE.desplazamiento.km_incluidos_gratis);
  const precioHospedaje = Number(tarifas.hospedaje_por_persona_noche ?? TARIFAS_BASE.hospedaje.precio_por_persona_noche);
  const precioDietas = Number(tarifas.dietas_por_persona_dia ?? TARIFAS_BASE.dietas.por_persona_dia);

  const kmExtra = Math.max(0, distancia - kmGratis);
  const costeDesplazamiento = Number((kmExtra * precioPorKm).toFixed(2));
  const costeHospedaje = hospedajeIncluido ? 0 : Number((num_habitaciones * precioHospedaje * dias).toFixed(2));
  const costeDietas = Number((precioDietas * 4 * dias).toFixed(2));

  return {
    coste_desplazamiento: costeDesplazamiento,
    coste_hospedaje: costeHospedaje,
    coste_dietas: costeDietas
  };
}

function generarPresupuestoCerrado(datos: any, tarifas: Record<string, number>) {
  const budget = Number(datos.presupuesto_disponible || 0);
  const { coste_desplazamiento, coste_hospedaje, coste_dietas } = construirPresupuestoBase(datos, tarifas);
  const extraTecnicoSonido = Number(tarifas.tecnico_sonido ?? TARIFAS_BASE.tecnico_sonido.precio);
  const extraTecnicoLuces = Number(tarifas.tecnico_luces ?? TARIFAS_BASE.tecnico_luces.precio);
  const extraEquipo = Number(tarifas.equipo_tecnico_completo ?? TARIFAS_BASE.equipo_tecnico_completo.precio);
  const extraVisuales = Number(tarifas.visuales ?? TARIFAS_BASE.visuales.precio);

  const formatos: Formato[] = ["quinteto", "cuarteto", "trio", "duo"];
  const desiredTecnicoSonido = Boolean(datos.incluye_tecnico_sonido);
  const desiredTecnicoLuces = Boolean(datos.incluye_tecnico_luces);
  const desiredEquipo = Boolean(datos.incluye_equipo_tecnico_completo);
  const desiredVisuales = Boolean(datos.incluye_visuales);

  for (const formato of formatos) {
    const cacheFormato = obtenerPrecioFormato(formato, tarifas);
    const baseTotal = cacheFormato + coste_desplazamiento + coste_hospedaje + coste_dietas;
    if (baseTotal > budget) continue;

    let coste_tecnico_sonido = desiredTecnicoSonido ? extraTecnicoSonido : 0;
    let coste_tecnico_luces = desiredTecnicoLuces ? extraTecnicoLuces : 0;
    let coste_equipo_tecnico = desiredEquipo ? extraEquipo : 0;
    let coste_visuales = desiredVisuales ? extraVisuales : 0;

    let total = Number((baseTotal + coste_tecnico_sonido + coste_tecnico_luces + coste_equipo_tecnico + coste_visuales).toFixed(2));
    if (total <= budget) {
      return {
        formato,
        cache_formato: cacheFormato,
        coste_tecnico_sonido,
        coste_tecnico_luces,
        coste_equipo_tecnico,
        coste_visuales,
        coste_desplazamiento,
        coste_hospedaje,
        coste_dietas,
        total
      };
    }

    if (coste_visuales > 0) {
      coste_visuales = 0;
      total = Number((baseTotal + coste_tecnico_sonido + coste_tecnico_luces + coste_equipo_tecnico).toFixed(2));
      if (total <= budget) {
        return {
          formato,
          cache_formato: cacheFormato,
          coste_tecnico_sonido,
          coste_tecnico_luces,
          coste_equipo_tecnico,
          coste_visuales,
          coste_desplazamiento,
          coste_hospedaje,
          coste_dietas,
          total
        };
      }
    }

    if (coste_equipo_tecnico > 0) {
      coste_equipo_tecnico = 0;
      total = Number((baseTotal + coste_tecnico_sonido + coste_tecnico_luces + coste_visuales).toFixed(2));
      if (total <= budget) {
        return {
          formato,
          cache_formato: cacheFormato,
          coste_tecnico_sonido,
          coste_tecnico_luces,
          coste_equipo_tecnico,
          coste_visuales,
          coste_desplazamiento,
          coste_hospedaje,
          coste_dietas,
          total
        };
      }
    }

    if (coste_tecnico_luces > 0) {
      coste_tecnico_luces = 0;
      total = Number((baseTotal + coste_tecnico_sonido + coste_equipo_tecnico + coste_visuales).toFixed(2));
      if (total <= budget) {
        return {
          formato,
          cache_formato: cacheFormato,
          coste_tecnico_sonido,
          coste_tecnico_luces,
          coste_equipo_tecnico,
          coste_visuales,
          coste_desplazamiento,
          coste_hospedaje,
          coste_dietas,
          total
        };
      }
    }

    if (coste_tecnico_sonido > 0) {
      coste_tecnico_sonido = 0;
      total = Number((baseTotal + coste_tecnico_luces + coste_equipo_tecnico + coste_visuales).toFixed(2));
      if (total <= budget) {
        return {
          formato,
          cache_formato: cacheFormato,
          coste_tecnico_sonido,
          coste_tecnico_luces,
          coste_equipo_tecnico,
          coste_visuales,
          coste_desplazamiento,
          coste_hospedaje,
          coste_dietas,
          total
        };
      }
    }
  }

  const formatoFallback: Formato = "duo";
  const cacheFormato = obtenerPrecioFormato(formatoFallback, tarifas);
  const baseTotal = cacheFormato + coste_desplazamiento + coste_hospedaje + coste_dietas;

  return {
    formato: formatoFallback,
    cache_formato: cacheFormato,
    coste_tecnico_sonido: 0,
    coste_tecnico_luces: 0,
    coste_equipo_tecnico: 0,
    coste_visuales: 0,
    coste_desplazamiento,
    coste_hospedaje,
    coste_dietas,
    total: Number(baseTotal.toFixed(2))
  };
}

export async function calcularPresupuesto(datos: any) {
  const tarifas = await obtenerTarifas();
  const { tipo_solicitud, formato, incluye_tecnico_sonido, incluye_tecnico_luces, incluye_equipo_tecnico_completo, incluye_visuales, distancia_madrid_km, hospedaje_incluido, num_habitaciones } = datos;

  if (tipo_solicitud === "presupuesto_cerrado") {
    return generarPresupuestoCerrado(datos, tarifas);
  }

  const resultado: any = {
    cache_formato: 0,
    coste_tecnico_sonido: 0,
    coste_tecnico_luces: 0,
    coste_equipo_tecnico: 0,
    coste_visuales: 0,
    coste_desplazamiento: 0,
    coste_hospedaje: 0,
    coste_dietas: 0,
    total: 0
  };

  if (tipo_solicitud === "elegir_formato" && formato) {
    resultado.cache_formato = obtenerPrecioFormato(formato, tarifas);
  }
  if (incluye_tecnico_sonido) {
    resultado.coste_tecnico_sonido = Number(tarifas.tecnico_sonido ?? TARIFAS_BASE.tecnico_sonido.precio);
  }
  if (incluye_tecnico_luces) {
    resultado.coste_tecnico_luces = Number(tarifas.tecnico_luces ?? TARIFAS_BASE.tecnico_luces.precio);
  }
  if (incluye_equipo_tecnico_completo) {
    resultado.coste_equipo_tecnico = Number(tarifas.equipo_tecnico_completo ?? TARIFAS_BASE.equipo_tecnico_completo.precio);
  }
  if (incluye_visuales) {
    resultado.coste_visuales = Number(tarifas.visuales ?? TARIFAS_BASE.visuales.precio);
  }
  const km = Number(distancia_madrid_km || 0);
  const kmGratis = Number(tarifas.desplazamiento_km_gratis ?? TARIFAS_BASE.desplazamiento.km_incluidos_gratis);
  const precioPorKm = Number(tarifas.desplazamiento_por_km ?? TARIFAS_BASE.desplazamiento.precio_por_km);
  if (km > kmGratis) {
    const extra = km - kmGratis;
    resultado.coste_desplazamiento = Number((extra * precioPorKm).toFixed(2));
  }

  if (!hospedaje_incluido && num_habitaciones && num_habitaciones > 0) {
    const noches = 1;
    resultado.coste_hospedaje = Number((num_habitaciones * Number(tarifas.hospedaje_por_persona_noche ?? TARIFAS_BASE.hospedaje.precio_por_persona_noche) * noches).toFixed(2));
  }

  const dias = 1;
  resultado.coste_dietas = Number((Number(tarifas.dietas_por_persona_dia ?? TARIFAS_BASE.dietas.por_persona_dia) * 4 * dias).toFixed(2));

  resultado.total = Number(
    (
      resultado.cache_formato +
      resultado.coste_tecnico_sonido +
      resultado.coste_tecnico_luces +
      resultado.coste_equipo_tecnico +
      resultado.coste_visuales +
      resultado.coste_desplazamiento +
      resultado.coste_hospedaje +
      resultado.coste_dietas
    ).toFixed(2)
  );

  return resultado;
}

export function generarRider(formato: Formato, datos: any) {
  const base: Record<Formato, any> = {
    duo: {
      nombre: "Rider Técnico - Dúo",
      necesidades: ["1 micrófono vocal (SM58 o similar)", "1 línea de instrumento (DI box)", "2 monitores de escenario", "Mesa de mezclas mínimo 8 canales"],
      escenario_minimo: "3m x 2m",
      sonido_minimo: "500W PA"
    },
    trio: {
      nombre: "Rider Técnico - Trío",
      necesidades: ["2 micrófonos vocales (SM58 o similar)", "1 micrófono de percusión / overhead", "2 líneas de instrumento (DI box)", "3 monitores de escenario", "Mesa de mezclas mínimo 12 canales"],
      escenario_minimo: "4m x 3m",
      sonido_minimo: "1000W PA"
    },
    cuarteto: {
      nombre: "Rider Técnico - Cuarteto",
      necesidades: ["2 micrófonos vocales (SM58 o similar)", "2 micrófonos de percusión / overhead", "2 líneas de instrumento (DI box)", "4 monitores de escenario", "Mesa de mezclas mínimo 16 canales"],
      escenario_minimo: "5m x 4m",
      sonido_minimo: "2000W PA"
    },
    quinteto: {
      nombre: "Rider Técnico - Quinteto",
      necesidades: ["3 micrófonos vocales (SM58 o similar)", "2 micrófonos de percusión / overhead", "3 líneas de instrumento (DI box)", "5 monitores de escenario", "Mesa de mezclas mínimo 20 canales"],
      escenario_minimo: "6m x 4m",
      sonido_minimo: "3000W PA"
    }
  };

  if (!formato || !base[formato]) {
    formato = "duo";
  }

  const rider = base[formato];
  const necesidades: string[] = [...rider.necesidades];

  if (datos.incluye_tecnico_sonido) {
    necesidades.push("Técnico de sonido extra con experiencia en directo.");
  }
  if (datos.incluye_tecnico_luces) {
    necesidades.push("Técnico de iluminación para control de focos y cuñas.");
  }
  if (datos.incluye_visuales) {
    necesidades.push("Requisitos para la instalación de proyección visual y mapping.");
  }

  return {
    ...rider,
    necesidades,
    nota: `Evento: ${datos.nombre_evento || "N/A"} - Lugar: ${datos.nombre_espacio || "N/A"}`
  };
}

export function calcularHojaRuta(solicitud: any, _presupuesto: any) {
  const dist = Number(solicitud.distancia_madrid_km || 0);
  const salidaHora = "10:00";
  const pruebaSonido = "3h antes";
  const horaShow = solicitud.hora_evento || "21:00";

  return {
    titulo: `HOJA DE RUTA — ${solicitud.nombre_evento}`,
    fecha: solicitud.fecha_evento,
    lugar: `${solicitud.nombre_espacio}, ${solicitud.ciudad}`,
    formato: solicitud.formato || "N/A",
    distancia: `${dist} km`,
    hora_salida_estimada: salidaHora,
    hora_prueba_sonido: pruebaSonido,
    hora_show: horaShow,
    equipo_que_viaja: solicitud.formato === "quinteto" ? ["Voz", "Guitarra", "Bajo", "Batería", "Teclado"] : ["Voz", "Instrumentos"],
    tecnicos: `${solicitud.incluye_tecnico_sonido ? "Sí" : "No"}, ${solicitud.incluye_tecnico_luces ? "Sí" : "No"}`,
    hospedaje: solicitud.hospedaje_incluido ? "Contratador provee hospedaje" : `${solicitud.num_habitaciones || 0} habitaciones`,
    contacto_programador: `${solicitud.nombre_programador} - ${solicitud.telefono || "-"} - ${solicitud.email}`,
    notas: solicitud.notas_adicionales || ""
  };
}
