import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";

import { generateClinicalSummary } from "@/lib/clinical-summary.functions";
import {
  adherence,
  borgLabels,
  intensityLabels,
  progressionLabels,
  calculateWeeklyVolume,
  reasonLabels,
  streakOf,
  typeLabels,
  useAppState,
  type ExerciseType,
  type Intensity,
  type ProgressionPace,
} from "@/lib/plan-store";

export const Route = createFileRoute("/personal-medico")({
  head: () => ({
    meta: [
      { title: "Panel Personal de Salud · Prescripción FITT-VP" },
      {
        name: "description",
        content:
          "Prescripción FITT-VP (Frecuencia, Intensidad, Tiempo, Tipo, Volumen y Progresión), panel de adherencia y resumen clínico con IA.",
      },
      { property: "og:title", content: "Panel Personal de Salud · Prescripción FITT-VP" },
      {
        property: "og:description",
        content: "Seleccione un paciente, revise sus registros y configure su prescripción FITT-VP.",
      },
    ],
  }),
  component: StaffView,
});

const fieldCls =
  "mt-2 w-full rounded-xl border-2 border-input bg-card px-4 py-3 text-lg text-foreground";

function StaffView() {
  const { patients, patient, plan, logs, setPlan, selectPatient } = useAppState();
  const callSummary = useServerFn(generateClinicalSummary);

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryFor, setSummaryFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patientId = patient?.id;
  useEffect(() => {
    if (!patientId || window.location.hash !== "#fitt") return;
    const t = window.setTimeout(
      () => document.getElementById("fitt")?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
    return () => window.clearTimeout(t);
  }, [patientId]);

  const adh = useMemo(() => adherence(logs), [logs]);
  const streak = useMemo(() => streakOf(logs), [logs]);
  const hardDays = useMemo(
    () => logs.filter((l) => l.borg === "agotado" || l.borg === "cansado").length,
    [logs],
  );

  const status =
    adh >= 80 && hardDays <= 2
      ? { label: "Respuesta adecuada al plan", tone: "success" as const }
      : adh >= 50
        ? { label: "Requiere vigilancia", tone: "warning" as const }
        : { label: "Riesgo de deterioro funcional", tone: "destructive" as const };

  const toneCls: Record<"success" | "warning" | "destructive", string> = {
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    destructive: "bg-destructive text-destructive-foreground",
  };

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callSummary({
        data: {
          patientName: plan.patientName,
          age: patient.age,
          room: plan.room,
          diagnosis: patient.diagnosis,
          plan: {
            daysPerWeek: plan.daysPerWeek,
            sessionsPerDay: plan.sessionsPerDay,
            minutes: plan.minutes,
            intensity: intensityLabels[plan.intensity],
            type: typeLabels[plan.type],
          },
          logs: [...logs]
            .sort((a, b) => (a.date < b.date ? -1 : 1))
            .map((l) => ({
              date: l.date,
              done: l.done,
              ...(l.borg ? { borg: borgLabels[l.borg].label } : {}),
              ...(l.reason ? { reason: reasonLabels[l.reason] } : {}),
            })),
        },
      });
      setSummary(result.summary || "El modelo no devolvió texto. Intente nuevamente.");
      setSummaryFor(plan.patientName);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el resumen.");
    } finally {
      setLoading(false);
    }
  };

  if (patients.length === 0) {
    return (
      <div className="card-surface space-y-4 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-3xl">
          🩺
        </div>
        <h2 className="font-display text-2xl font-bold">Panel Personal de Salud</h2>
        <p className="mx-auto max-w-md text-lg text-muted-foreground">
          Para evaluar adherencia, ajustar la prescripción FITT-VP o generar resúmenes clínicos, primero registra a tus pacientes.
        </p>
        <div className="pt-2">
          <Link
            to="/pacientes"
            className="tap-target inline-flex items-center justify-center bg-primary px-6 py-4 text-xl font-bold text-primary-foreground shadow-md hover:opacity-90"
          >
            ➕ Ir a Pacientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
            Portal Clínico y Prescripción
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Panel Personal de Salud</h1>
          <p className="mt-1 text-base text-muted-foreground">
            Prescripción FITT-VP, panel de adherencia, control de racha y resumen clínico con IA.
          </p>
        </div>
      </div>

      <section className="card-surface p-6">
        <h2 className="font-display text-xl font-bold">Seleccione un paciente</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {patients.map((p) => {
            const active = p.id === patient.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  selectPatient(p.id);
                  setSummary(null);
                  setError(null);
                }}
                aria-pressed={active}
                className={`rounded-2xl border-2 px-4 py-4 text-left text-lg ${
                  active
                    ? "border-primary bg-primary-soft text-foreground"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <span className="block font-bold">{p.plan.patientName}</span>
                <span className="block text-base text-muted-foreground">
                  {p.plan.room} · {p.age} años
                </span>
                <span className="block text-base text-muted-foreground">{p.diagnosis}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card-surface flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h1 className="font-display text-3xl font-bold">{plan.patientName}</h1>
          <p className="text-lg text-muted-foreground">
            {plan.room} · {patient.age} años · {patient.diagnosis}
          </p>
        </div>
        <span className={`rounded-full px-5 py-2 text-base font-bold ${toneCls[status.tone]}`}>
          {status.label}
        </span>
      </section>

      <section className="card-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Resumen clínico</h2>
            <p className="text-base text-muted-foreground">
              Analiza los registros del paciente seleccionado: adherencia, esfuerzo percibido y
              motivos de incumplimiento.
            </p>
          </div>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="tap-target bg-primary px-6 py-4 text-lg text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Generando…" : "Generar resumen"}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-2xl bg-destructive px-4 py-3 text-base text-destructive-foreground">
            {error}
          </p>
        )}

        {loading && !error && (
          <p className="mt-4 text-base text-muted-foreground">
            Analizando los registros de los últimos días…
          </p>
        )}

        {summary && !loading && (
          <article className="mt-4 whitespace-pre-wrap rounded-2xl border border-border bg-muted px-5 py-4 text-lg leading-relaxed">
            {summaryFor && summaryFor !== plan.patientName && (
              <p className="mb-2 text-base font-bold text-warning">
                Resumen generado para {summaryFor}.
              </p>
            )}
            {summary}
          </article>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section id="fitt" className="card-surface scroll-mt-40 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                Protocolo Clínico Internacional (ACSM / OMS)
              </span>
              <h2 className="font-display text-2xl font-bold">Prescripción FITT-VP</h2>
              <p className="text-base text-muted-foreground">
                Frecuencia, Intensidad, Tiempo, Tipo + Volumen y Progresión adaptada.
              </p>
            </div>
            <div className="rounded-xl bg-primary-soft px-3.5 py-1.5 text-center">
              <span className="text-xs font-bold text-muted-foreground uppercase block">Volumen (V)</span>
              <span className="text-xl font-extrabold text-primary">
                {calculateWeeklyVolume(plan)} min/sem
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-base font-bold">
              [F] Frecuencia (días/semana)
              <input
                type="number"
                min={1}
                max={7}
                value={plan.daysPerWeek}
                onChange={(e) => setPlan({ daysPerWeek: Number(e.target.value) })}
                className={fieldCls}
              />
            </label>
            <label className="block text-base font-bold">
              [F] Sesiones por día
              <input
                type="number"
                min={1}
                max={6}
                value={plan.sessionsPerDay}
                onChange={(e) => setPlan({ sessionsPerDay: Number(e.target.value) })}
                className={fieldCls}
              />
            </label>
            <label className="block text-base font-bold">
              [I] Intensidad esperada
              <select
                value={plan.intensity}
                onChange={(e) => setPlan({ intensity: e.target.value as Intensity })}
                className={fieldCls}
              >
                {(Object.keys(intensityLabels) as Intensity[]).map((k) => (
                  <option key={k} value={k}>
                    {intensityLabels[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-base font-bold">
              [T] Tiempo (minutos/sesión)
              <input
                type="number"
                min={3}
                max={60}
                value={plan.minutes}
                onChange={(e) => setPlan({ minutes: Number(e.target.value) })}
                className={fieldCls}
              />
            </label>
            <label className="block text-base font-bold">
              [T] Tipo de ejercicio
              <select
                value={plan.type}
                onChange={(e) => setPlan({ type: e.target.value as ExerciseType })}
                className={fieldCls}
              >
                {(Object.keys(typeLabels) as ExerciseType[]).map((k) => (
                  <option key={k} value={k}>
                    {typeLabels[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-base font-bold">
              Hora de alarma por voz
              <input
                type="time"
                value={plan.scheduleTime}
                onChange={(e) => setPlan({ scheduleTime: e.target.value })}
                className={fieldCls}
              />
            </label>
          </div>

          {/* Factores FITT-VP: Volumen y Progresión */}
          <div className="rounded-2xl border border-primary/30 bg-primary-soft/20 p-4 space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <span>📊 [V] Volumen Total & [P] Progresión Clínica</span>
            </h3>

            {/* Volumen */}
            <div>
              <div className="flex justify-between text-sm font-bold">
                <span>Dosis acumulada semanal:</span>
                <span className="text-primary font-extrabold">
                  {calculateWeeklyVolume(plan)} minutos / semana
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (calculateWeeklyVolume(plan) / 150) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Meta recomendada para adultos (OMS/ACSM): 150 min/semana. Actualmente al{" "}
                {Math.round((calculateWeeklyVolume(plan) / 150) * 100)}% de la dosis cardioprotectora.
              </p>
            </div>

            {/* Progresión */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/60">
              <label className="block text-sm font-bold">
                [P] Ritmo de Progresión
                <select
                  value={plan.progressionPace || "gradual"}
                  onChange={(e) => setPlan({ progressionPace: e.target.value as ProgressionPace })}
                  className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2 text-base"
                >
                  {(Object.keys(progressionLabels) as ProgressionPace[]).map((p) => (
                    <option key={p} value={p}>
                      {progressionLabels[p].label}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {progressionLabels[plan.progressionPace || "gradual"].desc}
                </span>
              </label>

              <label className="block text-sm font-bold">
                Criterio / Próximo hito de avance
                <input
                  type="text"
                  placeholder="Ej. +2 min/semana si Borg ≤ normal"
                  value={plan.progressionNotes || ""}
                  onChange={(e) => setPlan({ progressionNotes: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2 text-base"
                />
                <span className="mt-1 block text-xs text-muted-foreground">
                  Condición clínica para aumentar tiempo o dificultad.
                </span>
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="card-surface p-4 text-center">
              <p className="text-3xl font-extrabold text-primary">{adh}%</p>
              <p className="text-sm font-bold text-muted-foreground">Adherencia 7 días</p>
            </div>
            <div className="card-surface p-4 text-center">
              <p className="text-3xl font-extrabold text-warm">🔥 {streak}</p>
              <p className="text-sm font-bold text-muted-foreground">Racha actual</p>
            </div>
            <div className="card-surface p-4 text-center">
              <p className="text-3xl font-extrabold text-accent">
                {plan.daysPerWeek}×{plan.sessionsPerDay}
              </p>
              <p className="text-sm font-bold text-muted-foreground">Sesiones prescritas</p>
            </div>
          </div>

          <div className="card-surface p-6">
            <h2 className="font-display text-2xl font-bold">Seguimiento diario</h2>
            <ul className="mt-4 space-y-3">
              {[...logs]
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .slice(0, 8)
                .map((l) => {
                  const tone = !l.done
                    ? "destructive"
                    : l.borg === "agotado"
                      ? "warning"
                      : "success";
                  return (
                    <li
                      key={l.date}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3"
                    >
                      <span className="text-base font-bold">
                        {new Date(`${l.date}T12:00:00`).toLocaleDateString("es-CO", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="text-base text-muted-foreground">
                        {l.done
                          ? `${borgLabels[l.borg ?? "normal"].emoji} ${borgLabels[l.borg ?? "normal"].label}`
                          : `No realizado · ${reasonLabels[l.reason ?? "singanas"]}`}
                      </span>
                      <span
                        aria-hidden
                        className={`size-4 shrink-0 rounded-full ${toneCls[tone].split(" ")[0]}`}
                      />
                    </li>
                  );
                })}
            </ul>
            <p className="mt-4 text-base text-muted-foreground">
              Verde: cumple el plan · Amarillo: esfuerzo elevado, considere reducir intensidad ·
              Rojo: sesión no realizada.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
