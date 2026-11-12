import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { ExerciseAvatar } from "@/components/ExerciseAvatar";
import {
  borgLabels,
  intensityLabels,
  reasonLabels,
  streakOf,
  todayKey,
  typeLabels,
  useAppState,
  type Borg,
  type SkipReason,
} from "@/lib/plan-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mi ejercicio de hoy · Movilidad Hospitalaria" },
      {
        name: "description",
        content:
          "Vista del paciente: recordatorio de ejercicio, avatar guía, racha de días y registro de esfuerzo con caritas.",
      },
      { property: "og:title", content: "Mi ejercicio de hoy · Movilidad Hospitalaria" },
      {
        property: "og:description",
        content: "Ejercicio guiado paso a paso para pacientes hospitalizados mayores de 60 años.",
      },
    ],
  }),
  component: PatientView,
});

const motivational = [
  "¡Excelente trabajo! Redujo su riesgo de infarto y cada paso lo acerca a volver a casa.",
  "¡Muy bien! Moverse hoy protege su fuerza muscular y su independencia.",
  "¡Lo logró! Su corazón y sus pulmones se lo agradecen.",
  "¡Felicitaciones! Menos días en cama significa una recuperación más rápida.",
];

function playVoiceExerciseAlarm(patientName?: string) {
  try {
    // 1. Acorde musical suave tipo campana relajante (elimina cualquier parecido con alarmas de hospital)
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      // Notas cálidas musicales ascendentes (Do-Mi-Sol)
      [261.6, 329.6, 392.0].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.12, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.55);
      });
    }

    // 2. Voz hablada diciendo "¡Hay que hacer ejercicio, hay que hacer ejercicio!"
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const firstName = patientName ? patientName.trim().split(" ")[0] : "";
      const saludo = firstName ? `¡Hola ${firstName}! ` : "¡Atención! ";
      const mensaje = `${saludo}¡Hay que hacer ejercicio! ¡Hay que hacer ejercicio! Es momento de su sesión de movilidad. Moverse hoy le ayudará a sentirse con más energía.`;

      const utter = new SpeechSynthesisUtterance(mensaje);
      utter.lang = "es-ES";
      utter.rate = 0.92;
      utter.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find((v) => v.lang.startsWith("es-") || v.lang.startsWith("es"));
      if (esVoice) utter.voice = esVoice;

      window.setTimeout(() => {
        window.speechSynthesis.speak(utter);
      }, 500);
    }
  } catch (err) {
    console.warn("Aviso de voz no disponible:", err);
  }
}

function PatientView() {
  const { patients, patient, plan, logs, hydrated, logToday, selectPatient } = useAppState();
  const [alarmOn, setAlarmOn] = useState(false);
  const [step, setStep] = useState<"inicio" | "borg" | "motivos" | "listo">("inicio");
  const [message, setMessage] = useState("");
  const chimed = useRef(false);

  const today = useMemo(() => logs.find((l) => l.date === todayKey()), [logs]);
  const streak = useMemo(() => streakOf(logs), [logs]);

  useEffect(() => {
    if (!hydrated) return;
    if (today) {
      setStep("listo");
      return;
    }
    const t = window.setTimeout(() => {
      setAlarmOn(true);
      if (!chimed.current) {
        playVoiceExerciseAlarm(plan.patientName);
        chimed.current = true;
      }
    }, 1200);
    return () => window.clearTimeout(t);
  }, [hydrated, today]);

  const confirm = () => {
    setAlarmOn(false);
    setStep("borg");
  };

  const saveBorg = (borg: Borg) => {
    logToday({ done: true, borg });
    setMessage(motivational[Math.floor(Math.random() * motivational.length)] ?? motivational[0]!);
    setStep("listo");
  };

  const saveSkip = (reason: SkipReason) => {
    logToday({ done: false, reason });
    setMessage("Gracias por avisarnos. Su equipo de salud lo revisará hoy mismo.");
    setStep("listo");
  };

  if (hydrated && patients.length === 0) {
    return (
      <div className="card-surface space-y-4 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-3xl">
          🏥
        </div>
        <h2 className="font-display text-2xl font-bold">Base de datos conectada con éxito</h2>
        <p className="mx-auto max-w-md text-lg text-muted-foreground">
          Tu Supabase está listo. Para comenzar a registrar la movilidad y ver el avatar de ejercicio, agrega a tu primer paciente.
        </p>
        <div className="pt-2">
          <Link
            to="/pacientes"
            className="tap-target inline-flex items-center justify-center bg-primary px-6 py-4 text-xl font-bold text-primary-foreground shadow-md hover:opacity-90"
          >
            ➕ Ir a Pacientes y crear el primero
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alarmOn && step === "inicio" && (
        <div
          role="alert"
          className="alarm-pulse flex flex-col gap-4 rounded-3xl bg-warm px-6 py-6 text-warm-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-display text-2xl font-bold">¡Es hora de moverse!</p>
            <p className="text-lg">
              Sesión programada de las {plan.scheduleTime}. Tómese {plan.minutes} minutos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                playVoiceExerciseAlarm(plan.patientName);
              }}
              className="tap-target flex items-center gap-2 border-2 border-warm-foreground/30 bg-warm-soft px-5 text-warm-foreground font-bold"
            >
              🗣️ Escuchar aviso ("¡Hay que hacer ejercicio!")
            </button>
            <button
              onClick={() => setAlarmOn(false)}
              className="tap-target bg-card px-5 text-foreground"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <section className="card-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base text-muted-foreground">Hola, {plan.patientName.split(" ")[0]}</p>
              {patients.length > 1 && (
                <select
                  value={patient.id}
                  onChange={(e) => selectPatient(e.target.value)}
                  className="rounded-lg border border-border bg-card px-2 py-1 text-sm font-semibold text-foreground"
                  aria-label="Cambiar paciente"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.plan.patientName} {p.plan.room ? `(${p.plan.room})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              Ejercicio de {typeLabels[plan.type].toLowerCase()}
            </h1>
            <p className="mt-1 text-base sm:text-lg text-muted-foreground">
              {plan.room ? `${plan.room} · ` : ""}{plan.minutes} minutos · Intensidad{" "}
              {intensityLabels[plan.intensity].toLowerCase()} · {plan.sessionsPerDay}{" "}
              {plan.sessionsPerDay === 1 ? "sesión" : "sesiones"} al día
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-primary">
                📊 Volumen (V):{" "}
                {plan.volumeWeeklyMinutes ||
                  plan.daysPerWeek * plan.sessionsPerDay * plan.minutes}{" "}
                min/semana
              </span>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-accent-foreground">
                🚀 Progresión (P): {plan.progressionPace || "Gradual"}
              </span>
              <button
                type="button"
                onClick={() => playVoiceExerciseAlarm(plan.patientName)}
                title="Reproducir aviso por voz motivacional"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground shadow-sm hover:bg-muted"
              >
                🗣️ Probar aviso por voz
              </button>
            </div>
          </div>
          <div className="rounded-3xl bg-warm-soft px-6 py-4 text-center">
            <p className="text-5xl font-extrabold text-warm-foreground">🔥 {streak}</p>
            <p className="text-base font-bold text-warm-foreground">días seguidos</p>
          </div>
        </div>

        <div className="mt-6">
          <ExerciseAvatar type={plan.type} playing={step !== "listo"} />
        </div>
      </section>

      {step === "inicio" && (
        <section className="space-y-4">
          <button
            onClick={confirm}
            className="tap-target w-full bg-accent py-8 text-2xl text-accent-foreground shadow-lg sm:text-3xl"
          >
            ✅ Ya hice mi ejercicio
          </button>
          <button
            onClick={() => setStep("motivos")}
            className="tap-target w-full border-2 border-border bg-card py-5 text-xl text-foreground"
          >
            Hoy no pude realizarlo
          </button>
        </section>
      )}

      {step === "borg" && (
        <section className="card-surface p-6">
          <h2 className="text-center font-display text-2xl font-bold">
            ¿Cómo se sintió el ejercicio?
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(Object.keys(borgLabels) as Borg[]).map((key) => (
              <button
                key={key}
                onClick={() => saveBorg(key)}
                className="tap-target flex items-center gap-4 border-2 border-border bg-card px-5 py-5 text-xl"
              >
                <span className="text-4xl" aria-hidden>
                  {borgLabels[key].emoji}
                </span>
                {borgLabels[key].label}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "motivos" && (
        <section className="card-surface p-6">
          <h2 className="text-center font-display text-2xl font-bold">¿Qué se lo impidió?</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(Object.keys(reasonLabels) as SkipReason[]).map((key) => (
              <button
                key={key}
                onClick={() => saveSkip(key)}
                className="tap-target border-2 border-border bg-card px-5 py-5 text-xl"
              >
                {reasonLabels[key]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep("inicio")}
            className="tap-target mt-4 w-full bg-muted text-lg text-foreground"
          >
            Volver
          </button>
        </section>
      )}

      {step === "listo" && (
        <section className="card-surface border-accent/40 bg-accent-soft p-6 text-center">
          <p className="text-5xl" aria-hidden>
            {today?.done === false ? "🤝" : "🎉"}
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold">
            {today?.done === false ? "Registro enviado" : "¡Registro completado!"}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xl">
            {message ||
              (today?.done
                ? motivational[0]
                : "Gracias por avisarnos. Su equipo de salud lo revisará hoy mismo.")}
          </p>
          {today?.borg && (
            <p className="mt-3 text-lg text-muted-foreground">
              Esfuerzo registrado: {borgLabels[today.borg].emoji} {borgLabels[today.borg].label}
            </p>
          )}
          {today?.reason && (
            <p className="mt-3 text-lg text-muted-foreground">
              Motivo registrado: {reasonLabels[today.reason]}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
