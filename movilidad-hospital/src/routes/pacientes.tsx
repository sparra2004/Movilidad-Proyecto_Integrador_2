import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { borgLabels, reasonLabels, typeLabels, useAppState, type Patient } from "@/lib/plan-store";

export const Route = createFileRoute("/pacientes")({
  head: () => ({
    meta: [
      { title: "Pacientes · Movilidad Hospitalaria" },
      {
        name: "description",
        content: "Lista de pacientes hospitalizados con su última actividad y acceso directo a su plan FITT.",
      },
      { property: "og:title", content: "Pacientes · Movilidad Hospitalaria" },
      {
        property: "og:description",
        content: "Vea a sus pacientes, su última actividad y abra su plan FITT con un toque.",
      },
    ],
  }),
  component: PatientsHome,
});

const tones = ["bg-primary", "bg-accent", "bg-warm"];
const toneText = ["text-primary-foreground", "text-accent-foreground", "text-warm-foreground"];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function lastActivity(p: Patient) {
  const last = [...p.logs].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!last) return { text: "Sin actividad registrada", dot: "bg-muted-foreground" };
  const date = new Date(`${last.date}T12:00:00`).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  if (last.done)
    return {
      text: `${date} · Hizo su ejercicio ${last.borg ? borgLabels[last.borg].emoji + " " + borgLabels[last.borg].label : ""}`,
      dot: last.borg === "agotado" ? "bg-warm" : "bg-accent",
    };
  return {
    text: `${date} · No pudo: ${last.reason ? reasonLabels[last.reason] : "sin motivo"}`,
    dot: "bg-destructive",
  };
}

const inputCls =
  "mt-2 w-full rounded-xl border-2 border-input bg-card px-4 py-3 text-lg text-foreground";

function NewPatientForm({ onDone }: { onDone: (id: string) => void }) {
  const { createPatient } = useAppState();
  const [name, setName] = useState("");
  const [age, setAge] = useState("70");
  const [room, setRoom] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(age);
    if (!name.trim() || !room.trim() || !(n >= 18 && n <= 120)) {
      setError("Complete nombre, habitación y una edad válida.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const id = await createPatient({
        patientName: name.trim(),
        age: n,
        room: room.trim(),
        diagnosis: diagnosis.trim(),
      });
      onDone(id);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-surface grid gap-4 p-6 sm:grid-cols-2">
      <h2 className="font-display text-2xl font-bold sm:col-span-2">Nuevo paciente</h2>
      <label className="text-lg font-bold sm:col-span-2">
        Nombre completo
        <input className={inputCls} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="text-lg font-bold">
        Edad
        <input className={inputCls} type="number" min={18} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
      </label>
      <label className="text-lg font-bold">
        Habitación
        <input className={inputCls} value={room} maxLength={20} placeholder="Hab. 410" onChange={(e) => setRoom(e.target.value)} />
      </label>
      <label className="text-lg font-bold sm:col-span-2">
        Diagnóstico
        <input className={inputCls} value={diagnosis} maxLength={200} onChange={(e) => setDiagnosis(e.target.value)} />
      </label>
      {error && <p className="text-lg font-bold text-destructive sm:col-span-2">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="tap-target bg-primary py-4 text-xl text-primary-foreground disabled:opacity-60 sm:col-span-2"
      >
        {saving ? "Creando…" : "Crear paciente y abrir su plan"}
      </button>
    </form>
  );
}

function PatientsHome() {
  const { patients, selectPatient, deletePatient, hydrated } = useAppState();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const open = (id: string) => {
    selectPatient(id);
    navigate({ to: "/personal-medico", hash: "fitt" });
  };

  const discharge = async (id: string, name: string) => {
    if (!window.confirm(`¿Dar de alta y eliminar a ${name}? Se borrarán sus registros.`)) return;
    await deletePatient(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Mis pacientes</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Toque un paciente para abrir su prescripción FITT-VP en el Panel Personal de Salud.{" "}
            <Link to="/guia" className="font-bold text-primary underline">
              Ver guía
            </Link>
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="tap-target bg-accent px-6 text-xl text-accent-foreground"
        >
          {showForm ? "Cancelar" : "＋ Nuevo paciente"}
        </button>
      </div>

      {showForm && <NewPatientForm onDone={(id) => open(id)} />}

      {!hydrated && (
        <p className="card-surface p-6 text-lg text-muted-foreground">Cargando pacientes…</p>
      )}
      {hydrated && patients.length === 0 && (
        <p className="card-surface p-6 text-lg text-muted-foreground">
          Aún no hay pacientes. Toque “＋ Nuevo paciente” para empezar.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {patients.map((p, i) => {
          const act = lastActivity(p);
          return (
            <li key={p.id}>
              <button
                onClick={() => open(p.id)}
                className="card-surface flex w-full items-center gap-4 p-5 text-left transition-shadow hover:shadow-lg"
              >
                <span
                  aria-hidden
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full font-display text-3xl font-bold ${tones[i % 3]} ${toneText[i % 3]}`}
                >
                  {initials(p.plan.patientName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-bold">{p.plan.patientName}</span>
                  <span className="block text-base text-muted-foreground">
                    {p.age} años · {p.plan.room} · {typeLabels[p.plan.type]}
                  </span>
                  <span className="mt-2 flex items-start gap-2 text-base">
                    <span className={`mt-2 h-3 w-3 shrink-0 rounded-full ${act.dot}`} />
                    <span className="first-letter:uppercase">{act.text}</span>
                  </span>
                </span>
                <span aria-hidden className="text-3xl text-muted-foreground">›</span>
              </button>
              <button
                onClick={() => void discharge(p.id, p.plan.patientName)}
                className="mt-2 w-full rounded-xl py-2 text-base font-bold text-muted-foreground hover:text-destructive"
              >
                Dar de alta y eliminar
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
