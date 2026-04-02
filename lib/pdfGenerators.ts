// Client-side only — jsPDF is loaded dynamically

const RED: [number, number, number] = [226, 48, 48];
const GOLD: [number, number, number] = [197, 165, 90];
const DARK: [number, number, number] = [30, 30, 30];
const GRAY_MID: [number, number, number] = [120, 120, 120];
const GRAY_LIGHT: [number, number, number] = [220, 220, 220];

const MARGIN = 18;
const PAGE_W = 210;

function slug(s: string) {
  return (s || "evento").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 30);
}

function drawHeader(doc: any, subtitle: string) {
  // Red header bar
  doc.setFillColor(...RED);
  doc.rect(0, 0, PAGE_W, 22, "F");

  // ALTILLO title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("ALTILLO", MARGIN, 14);

  // Subtitle on the right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(subtitle, PAGE_W - MARGIN, 14, { align: "right" });

  // Gold accent line under header
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, 24, PAGE_W - MARGIN, 24);
}

function drawFooter(doc: any, pageNum?: number) {
  const Y = 286;
  doc.setDrawColor(...GRAY_LIGHT);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, Y - 2, PAGE_W - MARGIN, Y - 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY_MID);
  doc.text("altillomusica.oficial@gmail.com  |  629 78 89 80  |  638 527 425", PAGE_W / 2, Y + 4, { align: "center" });
  if (pageNum) {
    doc.text(`Pág. ${pageNum}`, PAGE_W - MARGIN, Y + 4, { align: "right" });
  }
}

function sectionTitle(doc: any, text: string, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...RED);
  doc.text(text, MARGIN, y);
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.35);
  doc.line(MARGIN, y + 1.5, MARGIN + text.length * 1.9, y + 1.5);
  return y + 7;
}

function row(doc: any, label: string, value: string, y: number, colWidth = 38) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  doc.text(`${label}:`, MARGIN, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 55, 55);
  // Split long values
  const lines = doc.splitTextToSize(String(value || "—"), PAGE_W - MARGIN - colWidth - 5);
  doc.text(lines, MARGIN + colWidth, y);
  return y + (lines.length > 1 ? lines.length * 5.5 : 7);
}

// ─────────────────────────────────────────────
// 1. PRESUPUESTO
// ─────────────────────────────────────────────
export async function generarPresupuestoPDF(solicitud: any, presupuesto: any) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawHeader(doc, "Presupuesto de Contratación");
  drawFooter(doc, 1);

  let y = 32;

  // Date top-right
  const fechaHoy = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY_MID);
  doc.text(`Madrid, ${fechaHoy}`, PAGE_W - MARGIN, y, { align: "right" });
  y += 10;

  // —— Datos del evento ——
  y = sectionTitle(doc, "DATOS DEL EVENTO", y);
  y = row(doc, "Evento", solicitud.nombre_evento, y);
  y = row(doc, "Fecha", solicitud.fecha_evento, y);
  y = row(doc, "Hora", solicitud.hora_evento, y);
  y = row(doc, "Espacio", solicitud.nombre_espacio, y);
  y = row(doc, "Dirección", solicitud.direccion_espacio, y);
  y = row(doc, "Ciudad", solicitud.ciudad, y);
  y = row(doc, "Formato", (solicitud.formato || "N/A").toUpperCase(), y);
  y += 6;

  // —— Datos del programador ——
  y = sectionTitle(doc, "DATOS DEL PROGRAMADOR", y);
  y = row(doc, "Nombre", solicitud.nombre_programador, y);
  y = row(doc, "Email", solicitud.email, y);
  y = row(doc, "Teléfono", solicitud.telefono || "—", y);
  y += 8;

  // —— Tabla de presupuesto ——
  y = sectionTitle(doc, "DESGLOSE DEL PRESUPUESTO", y);

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(MARGIN, y - 4.5, PAGE_W - MARGIN * 2, 7.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text("Concepto", MARGIN + 3, y);
  doc.text("Importe", PAGE_W - MARGIN - 3, y, { align: "right" });
  doc.setDrawColor(...GRAY_LIGHT);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2);
  y += 8;

  const budgetItems = [
    [`Caché artístico — ${(solicitud.formato || "").toUpperCase()}`, presupuesto.cache_formato],
    ["Técnico de sonido", presupuesto.coste_tecnico_sonido],
    ["Técnico de luces", presupuesto.coste_tecnico_luces],
    ["Equipo técnico completo", presupuesto.coste_equipo_tecnico],
    ["Visuales en directo", presupuesto.coste_visuales],
    ["Desplazamiento", presupuesto.coste_desplazamiento],
    ["Hospedaje", presupuesto.coste_hospedaje],
    ["Dietas", presupuesto.coste_dietas],
  ].filter(([, v]) => Number(v) > 0);

  doc.setFontSize(9.5);
  budgetItems.forEach(([label, val], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(251, 251, 251);
      doc.rect(MARGIN, y - 4, PAGE_W - MARGIN * 2, 7, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(String(label), MARGIN + 3, y);
    doc.text(`${Number(val).toFixed(2)} €`, PAGE_W - MARGIN - 3, y, { align: "right" });
    y += 7;
  });

  // Total row
  y += 1;
  doc.setFillColor(...RED);
  doc.rect(MARGIN, y - 5, PAGE_W - MARGIN * 2, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", MARGIN + 3, y + 1);
  doc.text(`${Number(presupuesto.total).toFixed(2)} €`, PAGE_W - MARGIN - 3, y + 1, { align: "right" });
  y += 18;

  // —— Condiciones ——
  doc.setFillColor(255, 252, 243);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 28, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text("CONDICIONES DE PAGO", MARGIN + 4, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text("• Presupuesto válido durante 15 días desde la fecha de emisión.", MARGIN + 4, y + 14);
  doc.text("• 50% del importe al confirmar la actuación.", MARGIN + 4, y + 20);
  doc.text("• 50% restante a la finalización del evento.", MARGIN + 4, y + 26);

  doc.save(`presupuesto-altillo-${slug(solicitud.nombre_evento)}.pdf`);
}

// ─────────────────────────────────────────────
// 2. RIDER TÉCNICO
// ─────────────────────────────────────────────
const ESCENARIO: Record<string, string> = {
  duo: "3 m × 2 m mínimo",
  trio: "4 m × 3 m mínimo",
  cuarteto: "5 m × 4 m mínimo",
  quinteto: "6 m × 4 m mínimo",
};

const PA_MINIMO: Record<string, string> = {
  duo: "500 W PA",
  trio: "1.000 W PA",
  cuarteto: "2.000 W PA",
  quinteto: "3.000 W PA",
};

const NECESIDADES_BASE: Record<string, string[]> = {
  duo: [
    "1 micrófono vocal dinámico (SM58 o similar)",
    "1 línea de instrumento (DI box activa)",
    "2 monitores de escenario",
    "Mesa de mezclas mínimo 8 canales",
    `Sistema PA mínimo: ${PA_MINIMO.duo}`,
  ],
  trio: [
    "2 micrófonos vocales dinámicos (SM58 o similar)",
    "1 micrófono de percusión / overhead",
    "2 líneas de instrumento (DI boxes activas)",
    "3 monitores de escenario",
    "Mesa de mezclas mínimo 12 canales",
    `Sistema PA mínimo: ${PA_MINIMO.trio}`,
  ],
  cuarteto: [
    "2 micrófonos vocales dinámicos (SM58 o similar)",
    "2 micrófonos de percusión / overhead",
    "2 líneas de instrumento (DI boxes activas)",
    "4 monitores de escenario",
    "Mesa de mezclas mínimo 16 canales",
    `Sistema PA mínimo: ${PA_MINIMO.cuarteto}`,
  ],
  quinteto: [
    "3 micrófonos vocales dinámicos (SM58 o similar)",
    "2 micrófonos de percusión / overhead",
    "3 líneas de instrumento (DI boxes activas)",
    "5 monitores de escenario",
    "Mesa de mezclas mínimo 20 canales",
    `Sistema PA mínimo: ${PA_MINIMO.quinteto}`,
  ],
};

export async function generarRiderPDF(solicitud: any, presupuesto: any, hojaRuta: any) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const fmt = (solicitud.formato || "duo") as string;
  const fmtLabel = fmt.charAt(0).toUpperCase() + fmt.slice(1);

  drawHeader(doc, `Rider Técnico — ${fmtLabel}`);
  drawFooter(doc, 1);

  let y = 32;

  // Event summary box
  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(...GRAY_LIGHT);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 22, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text(solicitud.nombre_evento || "Evento", MARGIN + 4, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY_MID);
  doc.text(
    `${solicitud.fecha_evento}  •  ${solicitud.hora_evento}  •  ${solicitud.nombre_espacio}, ${solicitud.ciudad}`,
    MARGIN + 4,
    y + 15
  );

  // Gold badge: format
  doc.setFillColor(...GOLD);
  doc.roundedRect(PAGE_W - MARGIN - 30, y + 4, 28, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(fmtLabel.toUpperCase(), PAGE_W - MARGIN - 16, y + 10.5, { align: "center" });

  y += 32;

  // —— Escenario ——
  y = sectionTitle(doc, "NECESIDADES DE ESCENARIO", y);
  y = row(doc, "Dimensiones", ESCENARIO[fmt] || "Consultar", y);
  y = row(doc, "PA mínimo", PA_MINIMO[fmt] || "Consultar", y);
  y += 5;

  // —— Necesidades técnicas de sonido ——
  y = sectionTitle(doc, "NECESIDADES TÉCNICAS DE SONIDO", y);
  const necesidades = [...(NECESIDADES_BASE[fmt] || NECESIDADES_BASE.duo)];

  if (solicitud.incluye_tecnico_sonido) {
    necesidades.push("⚡ Altillo lleva técnico de sonido propio — se necesita acceso 3h antes");
  }
  if (solicitud.incluye_tecnico_luces) {
    necesidades.push("⚡ Altillo lleva técnico de luces propio — se necesita acceso al cuadro");
  }
  if (solicitud.incluye_equipo_tecnico_completo) {
    necesidades.push("⚡ Altillo lleva PA + mesa + microfonía completa — sin necesidad de backline");
  }
  if (solicitud.incluye_visuales) {
    necesidades.push("⚡ Visuales en directo: necesaria pantalla o superficie de proyección mínimo 3m × 2m + proyector FullHD");
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  necesidades.forEach((item) => {
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(`• ${item}`, PAGE_W - MARGIN * 2 - 6);
    doc.text(lines, MARGIN + 3, y);
    y += lines.length * 5.5 + 2;
  });

  y += 5;

  // —— Horarios ——
  y = sectionTitle(doc, "HORARIOS", y);
  y = row(doc, "Hora de carga/montaje", hojaRuta?.hora_salida_estimada ? `A confirmar (salida Madrid ~${hojaRuta.hora_salida_estimada})` : "A confirmar", y);
  y = row(doc, "Prueba de sonido", hojaRuta?.hora_prueba_sonido || "3 h antes del show", y);
  y = row(doc, "Apertura de puertas", "1 h antes del show", y);
  y = row(doc, "Show", solicitud.hora_evento || "A confirmar", y);
  y += 5;

  // —— Contacto técnico ——
  y = sectionTitle(doc, "CONTACTO TÉCNICO", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);
  doc.text("Para consultas técnicas: altillomusica.oficial@gmail.com | 629 78 89 80", MARGIN + 2, y);
  y += 6;
  doc.text(`Programador del evento: ${solicitud.nombre_programador} — ${solicitud.telefono || solicitud.email}`, MARGIN + 2, y);

  doc.save(`rider-tecnico-altillo-${slug(solicitud.nombre_evento)}.pdf`);
}

// ─────────────────────────────────────────────
// 3. FICHA ARTÍSTICA
// ─────────────────────────────────────────────
const FORMATOS_DESC: Record<string, string> = {
  duo: "Dos voces e instrumentos en formato íntimo. Flamenco y jazz en su expresión más pura. Ideal para espacios pequeños y eventos privados.",
  trio: "Voz, guitarra y percusión. La célula mínima donde el gazpacho empieza a tomar sabor. Versátil, dinámico, con toda la energía del proyecto.",
  cuarteto: "El formato más equilibrado de Altillo. Ritmo, melodía y armonía al completo. Perfecto para festivales medianos y salas.",
  quinteto: "El show completo: cinco músicos, producción visual, técnicos propios. Una experiencia inmersiva e irrepetible.",
};

export async function generarFichaPDF(solicitud: any) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const fmt = (solicitud.formato || "") as string;

  // — Big header —
  doc.setFillColor(...RED);
  doc.rect(0, 0, PAGE_W, 45, "F");

  // Gold accent stripe
  doc.setFillColor(...GOLD);
  doc.rect(0, 43, PAGE_W, 3, "F");

  // ALTILLO big title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.setTextColor(255, 255, 255);
  doc.text("ALTILLO", MARGIN, 28);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(255, 220, 200);
  doc.text("Gazpacho Musical", MARGIN, 38);

  // Format badge if applicable
  if (fmt) {
    const fmtLabel = fmt.charAt(0).toUpperCase() + fmt.slice(1);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(PAGE_W - MARGIN - 34, 12, 32, 14, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...RED);
    doc.text(fmtLabel.toUpperCase(), PAGE_W - MARGIN - 18, 21, { align: "center" });
  }

  let y = 56;

  // —— Descripción artística ——
  y = sectionTitle(doc, "EL PROYECTO", y);

  const descripcion = doc.splitTextToSize(
    "Altillo es un proyecto musical que fusiona flamenco, jazz, soul y músicas del mundo en un espectáculo lleno de originalidad y frescura. Un gazpacho musical donde cada ingrediente aporta su sabor único — ingredientes que se mezclan, se contradicen y se fusionan para crear algo que no se parece a nada que hayas escuchado antes.",
    PAGE_W - MARGIN * 2
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(45, 45, 45);
  doc.text(descripcion, MARGIN, y);
  y += descripcion.length * 5.5 + 8;

  // —— Formatos disponibles ——
  y = sectionTitle(doc, "FORMATOS DISPONIBLES", y);

  const formatsToShow = ["duo", "trio", "cuarteto", "quinteto"];
  formatsToShow.forEach((f) => {
    const isContracted = f === fmt;
    const fLabel = f.charAt(0).toUpperCase() + f.slice(1);

    if (isContracted) {
      doc.setFillColor(...RED);
      doc.rect(MARGIN, y - 4.5, PAGE_W - MARGIN * 2, 16, "F");
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 248, 248);
      doc.rect(MARGIN, y - 4.5, PAGE_W - MARGIN * 2, 16, "F");
      doc.setTextColor(...DARK);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(fLabel.toUpperCase(), MARGIN + 3, y + 1);

    if (isContracted) {
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 200, 200);
      doc.text("← FORMATO DE ESTE EVENTO", MARGIN + 28, y + 1);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    if (isContracted) {
      doc.setTextColor(255, 240, 240);
    } else {
      doc.setTextColor(80, 80, 80);
    }
    const descLines = doc.splitTextToSize(FORMATOS_DESC[f] || "", PAGE_W - MARGIN * 2 - 6);
    doc.text(descLines, MARGIN + 3, y + 6.5);

    y += 18;
  });

  y += 4;

  // —— Integrantes ——
  y = sectionTitle(doc, "INTEGRANTES", y);

  const integrantes = [
    ["Jorge", "Batería y percusión"],
    ["Ángela", "Percusión y voz"],
  ];
  if (fmt === "trio" || fmt === "cuarteto" || fmt === "quinteto") {
    integrantes.push(["Guitarra / voz", "Cuerdas y armonías"]);
  }
  if (fmt === "cuarteto" || fmt === "quinteto") {
    integrantes.push(["Bajo eléctrico", "Base rítmica"]);
  }
  if (fmt === "quinteto") {
    integrantes.push(["Teclados / synth", "Texturas y atmospheres"]);
  }

  const colW = (PAGE_W - MARGIN * 2) / 3;
  integrantes.forEach(([nombre, rol], i) => {
    const col = i % 3;
    const colY = y + Math.floor(i / 3) * 22;
    const colX = MARGIN + col * colW;

    // Photo placeholder
    doc.setFillColor(235, 235, 235);
    doc.setDrawColor(...GRAY_LIGHT);
    doc.setLineWidth(0.3);
    doc.rect(colX, colY, colW - 4, 12, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY_MID);
    doc.text(`Foto ${i + 1}`, colX + (colW - 4) / 2, colY + 7, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(nombre, colX, colY + 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_MID);
    doc.text(rol, colX, colY + 20);
  });

  y += Math.ceil(integrantes.length / 3) * 22 + 8;

  // —— Links ——
  y = sectionTitle(doc, "ENLACES", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 50);
  doc.text("Web:       altillomusica.com", MARGIN + 2, y);
  y += 6;
  doc.text("Instagram: @altillomusica.oficial", MARGIN + 2, y);
  y += 6;
  doc.text("Spotify:   Altillo — buscar en Spotify", MARGIN + 2, y);
  y += 6;
  doc.text("YouTube:   youtube.com/@altillomusica", MARGIN + 2, y);
  y += 10;

  // —— Contacto ——
  doc.setFillColor(250, 245, 240);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 22, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  doc.text("CONTACTO", MARGIN + 4, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);
  doc.text("altillomusica.oficial@gmail.com", MARGIN + 4, y + 13);
  doc.text("629 78 89 80  |  638 527 425", MARGIN + 4, y + 19);

  drawFooter(doc, 1);

  doc.save(`ficha-artistica-altillo-${slug(solicitud.nombre_evento)}.pdf`);
}
