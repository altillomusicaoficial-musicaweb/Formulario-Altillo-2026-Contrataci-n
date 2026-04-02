"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function TarifasPage() {
  const [tarifas, setTarifas] = useState<any[]>([]);
  const [edit, setEdit] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const fetchTarifas = async () => {
    const res = await fetch("/api/tarifas");
    const data = await res.json();
    setTarifas(data);
    setEdit(Object.fromEntries(data.map((t: any) => [t.clave, t.valor])));
  };

  useEffect(() => { fetchTarifas(); }, []);

  const saveTarifa = async (clave: string) => {
    const valor = Number(edit[clave]);
    await fetch("/api/tarifas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clave, valor })
    });
    setSaved((prev) => ({ ...prev, [clave]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [clave]: false })), 2000);
    fetchTarifas();
  };

  const groups: Record<string, any[]> = {};
  tarifas.forEach((t) => {
    const group = t.clave.startsWith("formato") ? "Formatos"
      : t.clave.startsWith("tecnico") || t.clave.startsWith("equipo") || t.clave === "visuales" ? "Extras técnicos"
      : t.clave.startsWith("desplazamiento") ? "Desplazamiento"
      : t.clave.startsWith("hospedaje") || t.clave.startsWith("dietas") ? "Alojamiento y dietas"
      : "Otros";
    if (!groups[group]) groups[group] = [];
    groups[group].push(t);
  });

  return (
    <main>
      <NavBar />
      <div className="container py-8" style={{ maxWidth: 800 }}>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title">Tarifas</h1>
            <p className="page-subtitle">Ajusta las tarifas base para el cálculo de presupuestos.</p>
          </div>
          <Link href="/admin" className="btn-ghost">← Admin</Link>
        </div>

        <div className="space-y-4">
          {Object.entries(groups).map(([groupName, items]) => (
            <div key={groupName} className="card">
              <p className="form-section-title">{groupName}</p>
              <div className="space-y-3">
                {items.map((t) => (
                  <div key={t.clave} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/85">{t.descripcion || t.clave}</p>
                      <p className="text-xs text-white/30 mt-0.5">{t.clave}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={edit[t.clave] ?? 0}
                        onChange={(e) => setEdit((prev) => ({ ...prev, [t.clave]: Number(e.target.value) }))}
                        className="form-input text-right"
                        style={{ width: 110 }}
                        step="0.01"
                        min={0}
                      />
                      <button
                        className="btn-red"
                        style={{ minWidth: 80 }}
                        onClick={() => saveTarifa(t.clave)}
                      >
                        {saved[t.clave] ? "✓" : "Guardar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
