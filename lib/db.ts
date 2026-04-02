import initSqlJs from "sql.js";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "altillo.db");

function saveToFile(sqlDb: any) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dbPath, Buffer.from(sqlDb.export()));
}

function makeStatement(sqlDb: any, sql: string) {
  return {
    run(...params: any[]) {
      const flat = params.flat().map((p) => (p === undefined ? null : p));
      sqlDb.run(sql, flat);
      const meta = sqlDb.exec("SELECT changes(), last_insert_rowid()");
      saveToFile(sqlDb);
      return {
        changes: (meta[0]?.values[0]?.[0] as number) ?? 0,
        lastInsertRowid: (meta[0]?.values[0]?.[1] as number) ?? 0,
      };
    },
    get(...params: any[]) {
      const flat = params.flat().map((p) => (p === undefined ? null : p));
      const stmt = sqlDb.prepare(sql);
      try {
        if (flat.length > 0) stmt.bind(flat);
        return stmt.step() ? stmt.getAsObject() : undefined;
      } finally {
        stmt.free();
      }
    },
    all(...params: any[]) {
      const flat = params.flat().map((p) => (p === undefined ? null : p));
      const stmt = sqlDb.prepare(sql);
      const rows: any[] = [];
      try {
        if (flat.length > 0) stmt.bind(flat);
        while (stmt.step()) rows.push(stmt.getAsObject());
      } finally {
        stmt.free();
      }
      return rows;
    },
  };
}

function makeDb(sqlDb: any) {
  return {
    exec(sql: string) {
      sqlDb.exec(sql);
    },
    prepare(sql: string) {
      return makeStatement(sqlDb, sql);
    },
  };
}

type Db = ReturnType<typeof makeDb>;

function initTables(sqlDb: any) {
  sqlDb.exec(`
    CREATE TABLE IF NOT EXISTS solicitudes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT DEFAULT (datetime('now')),
      nombre_programador TEXT NOT NULL,
      email TEXT NOT NULL,
      telefono TEXT,
      nombre_evento TEXT NOT NULL,
      fecha_evento TEXT NOT NULL,
      hora_evento TEXT NOT NULL,
      nombre_espacio TEXT NOT NULL,
      ciudad TEXT NOT NULL,
      direccion_espacio TEXT NOT NULL,
      distancia_madrid_km REAL,
      tipo_solicitud TEXT NOT NULL,
      formato TEXT,
      incluye_visuales INTEGER DEFAULT 0,
      incluye_tecnico_sonido INTEGER DEFAULT 0,
      incluye_tecnico_luces INTEGER DEFAULT 0,
      incluye_equipo_tecnico_completo INTEGER DEFAULT 0,
      presupuesto_disponible REAL,
      hospedaje_incluido INTEGER DEFAULT 0,
      hospedaje_cerca_venue INTEGER DEFAULT 0,
      num_habitaciones INTEGER,
      catering_incluido INTEGER DEFAULT 0,
      parking_disponible INTEGER DEFAULT 0,
      notas_adicionales TEXT,
      estado TEXT DEFAULT 'nueva',
      notas_internas TEXT
    );

    CREATE TABLE IF NOT EXISTS tarifas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clave TEXT UNIQUE NOT NULL,
      valor REAL NOT NULL,
      descripcion TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS presupuestos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solicitud_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      cache_formato REAL,
      coste_tecnico_sonido REAL DEFAULT 0,
      coste_tecnico_luces REAL DEFAULT 0,
      coste_equipo_tecnico REAL DEFAULT 0,
      coste_visuales REAL DEFAULT 0,
      coste_desplazamiento REAL DEFAULT 0,
      coste_hospedaje REAL DEFAULT 0,
      coste_dietas REAL DEFAULT 0,
      total REAL,
      estado TEXT DEFAULT 'borrador',
      enviado_at TEXT,
      aceptado_at TEXT,
      notas TEXT,
      FOREIGN KEY(solicitud_id) REFERENCES solicitudes(id)
    );

    CREATE TABLE IF NOT EXISTS riders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      presupuesto_id INTEGER,
      formato TEXT,
      contenido_rider TEXT,
      incluye_tecnico_sonido INTEGER DEFAULT 0,
      incluye_tecnico_luces INTEGER DEFAULT 0,
      incluye_visuales INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(presupuesto_id) REFERENCES presupuestos(id)
    );

    CREATE TABLE IF NOT EXISTS finanzas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      presupuesto_id INTEGER,
      fecha_evento TEXT,
      importe_total REAL,
      estado_pago TEXT DEFAULT 'pendiente',
      fecha_factura TEXT,
      fecha_cobro TEXT,
      metodo_pago TEXT,
      notas TEXT,
      FOREIGN KEY(presupuesto_id) REFERENCES presupuestos(id)
    );
  `);

  // Migrations: add PDF tracking columns if they don't exist yet
  try { sqlDb.run("ALTER TABLE solicitudes ADD COLUMN pdf_presupuesto_at TEXT"); } catch (_) { /* already exists */ }
  try { sqlDb.run("ALTER TABLE solicitudes ADD COLUMN pdf_rider_at TEXT"); } catch (_) { /* already exists */ }
  try { sqlDb.run("ALTER TABLE solicitudes ADD COLUMN pdf_ficha_at TEXT"); } catch (_) { /* already exists */ }

  const defaultRates = [
    ["formato_duo", 1200, "Voz + instrumento"],
    ["formato_trio", 1800, "Voz + 2 instrumentos"],
    ["formato_cuarteto", 2400, "Voz + 3 instrumentos"],
    ["formato_quinteto", 3000, "Voz + 4 instrumentos"],
    ["tecnico_sonido", 350, "Técnico de sonido propio"],
    ["tecnico_luces", 300, "Técnico de iluminación propio"],
    ["equipo_tecnico_completo", 800, "PA + mesa + microfonía + cableado"],
    ["visuales", 500, "Proyección de visuales en directo"],
    ["desplazamiento_por_km", 0.3, "€/km ida y vuelta"],
    ["desplazamiento_km_gratis", 50, "Km incluidos gratis"],
    ["hospedaje_por_persona_noche", 60, "€/persona/noche"],
    ["dietas_por_persona_dia", 25, "€/persona/día"],
  ];

  for (const r of defaultRates) {
    sqlDb.run(
      "INSERT OR IGNORE INTO tarifas (clave, valor, descripcion) VALUES (?, ?, ?)",
      [r[0], r[1], r[2]]
    );
  }
}

let initPromise: Promise<Db> | null = null;

async function initDb(): Promise<Db> {
  const SQL = await initSqlJs({
    locateFile: (file: string) =>
      path.join(process.cwd(), "node_modules/sql.js/dist", file),
  });

  let sqlDb: any;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }

  initTables(sqlDb);
  saveToFile(sqlDb);

  return makeDb(sqlDb);
}

export async function getDb(): Promise<Db> {
  if (!initPromise) {
    initPromise = initDb().catch((err) => {
      initPromise = null; // reset so next request retries
      throw err;
    });
  }
  return initPromise;
}
