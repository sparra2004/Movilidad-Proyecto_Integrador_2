import { useMemo, useState } from "react";
import { Play, Pause, RotateCcw, AlertTriangle, Wind, Info, Camera, Activity, Plus } from "lucide-react";
import { CLINICAL_EXERCISES } from "@/lib/exercises";
import type { ExerciseType } from "@/lib/plan-store";
import { ExerciseFigure, usePhase } from "./ExerciseFigure";

type Props = {
  type: ExerciseType;
  playing?: boolean;
};

export function ExerciseAvatar({ type, playing: initialPlaying = true }: Props) {
  const exercises = useMemo(() => CLINICAL_EXERCISES[type] ?? CLINICAL_EXERCISES.movilidad ?? [], [type]);
  const [selectedId, setSelectedId] = useState<string>(exercises[0]?.id || "");
  const [viewMode, setViewMode] = useState<"animation" | "photo">("animation");
  const [isPlaying, setIsPlaying] = useState<boolean>(initialPlaying);
  const [speed, setSpeed] = useState<"slow" | "normal">("slow");
  const [repCount, setRepCount] = useState<number>(0);

  // Si cambia la categoría (fuerza, movilidad, resistencia) y el ejercicio elegido ya no existe,
  // se usa el primero de la nueva lista.
  const currentExercise = useMemo(
    () => exercises.find((e) => e.id === selectedId) || exercises[0]!,
    [exercises, selectedId],
  );

  // Duración del ciclo en segundos ajustada según velocidad
  const cycleSeconds = useMemo(() => {
    const base = currentExercise.cycleDurationSec;
    return speed === "slow" ? base * 1.35 : base;
  }, [currentExercise, speed]);

  // Una sola fase (0 a 1) mueve el muñeco, cuenta repeticiones, marca la respiración y el paso activo.
  const t = usePhase(cycleSeconds, isPlaying, currentExercise.id, () => setRepCount((c) => c + 1));
  const isInhaling = t < 0.5;
  const activeStep = Math.min(
    currentExercise.steps.length - 1,
    Math.floor(t * currentExercise.steps.length),
  );

  return (
    <div className="space-y-4">
      {/* Selector de ejercicios dentro de la categoría y selector de modo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Ejercicios:
          </span>
          <div className="flex flex-wrap gap-2">
            {exercises.map((ex) => {
              const isSelected = ex.id === currentExercise.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    setSelectedId(ex.id);
                    setRepCount(0);
                  }}
                  className={`rounded-xl px-3.5 py-2 text-base font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2"
                      : "border border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {ex.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle Modo: animación vs foto de referencia */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card p-1">
          <button
            onClick={() => setViewMode("animation")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition-all ${
              viewMode === "animation"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="h-4 w-4" /> Animación
          </button>
          <button
            onClick={() => setViewMode("photo")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition-all ${
              viewMode === "photo"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Camera className="h-4 w-4" /> Foto de referencia
          </button>
        </div>
      </div>

      {/* Contenedor principal del ejercicio */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card to-primary-soft/30 p-4 sm:p-6 shadow-inner">
        {/* Encabezado del ejercicio activo */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {currentExercise.name}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
              <span>📍 {currentExercise.position}</span>
              <span>·</span>
              <span className="font-bold text-primary">🎯 {currentExercise.clinicalTarget}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/20 px-3.5 py-1 text-sm font-bold text-accent-foreground">
              Meta: {currentExercise.durationOrReps}
            </span>
          </div>
        </div>

        {/* MODO 1: animación del movimiento */}
        {viewMode === "animation" && (
          <div className="relative my-2 flex flex-col items-center justify-center">
            <div className="mb-2 flex items-center gap-2 rounded-full bg-muted/80 px-4 py-1 text-xs font-bold text-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span>Mire el movimiento y repítalo con calma</span>
            </div>
            <ExerciseFigure
              exerciseId={currentExercise.id}
              t={t}
              label={`Animación de ${currentExercise.name}`}
            />
          </div>
        )}

        {/* MODO 2: fotografía de referencia */}
        {viewMode === "photo" && (
          <div className="relative mx-auto my-3 max-w-xl overflow-hidden rounded-2xl border-2 border-primary/20 bg-card shadow-xl">
            <img
              src={currentExercise.image}
              alt={`Demostración real de ${currentExercise.name}`}
              className="h-72 w-full object-cover sm:h-96"
            />

            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/30 p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-bold backdrop-blur">
                  <Camera className="h-3.5 w-3.5 text-accent" /> Fotografía de referencia
                </span>
                <span className="rounded-full bg-primary/80 px-3 py-1 text-xs font-bold backdrop-blur">
                  Postura correcta
                </span>
              </div>

              <div className="rounded-xl bg-black/75 p-3 text-center backdrop-blur">
                <p className="flex items-center justify-center gap-2 text-base font-extrabold text-white sm:text-lg">
                  <Wind
                    className={`h-5 w-5 transition-transform duration-500 ${
                      isInhaling ? "scale-125 text-accent" : "scale-100 text-primary-soft"
                    }`}
                  />
                  <span>
                    {isInhaling
                      ? `🌬️ ${currentExercise.breathingInhale}`
                      : `💨 ${currentExercise.breathingExhale}`}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Guía de respiración sincronizada con el movimiento */}
        <div className="mt-2 flex flex-col items-center justify-center rounded-2xl border border-border bg-card/90 p-3 backdrop-blur">
          <div className="flex items-center gap-2 text-base font-bold sm:text-lg">
            <Wind
              className={`h-5 w-5 transition-transform duration-500 ${
                isInhaling ? "scale-125 text-accent" : "scale-100 text-primary"
              }`}
            />
            <span
              className={isInhaling ? "font-extrabold text-accent" : "font-extrabold text-primary"}
            >
              {isInhaling
                ? `🌬️ ${currentExercise.breathingInhale}`
                : `💨 ${currentExercise.breathingExhale}`}
            </span>
          </div>

          <div className="mt-2 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all duration-700 ease-in-out ${
                isInhaling ? "w-full bg-accent" : "w-1/4 bg-primary"
              }`}
            />
          </div>
        </div>

        {/* Controles para el paciente */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className={`tap-target flex items-center gap-2 px-5 py-2.5 text-lg font-bold ${
                isPlaying
                  ? "border-2 border-border bg-card text-foreground hover:bg-muted"
                  : "bg-primary text-primary-foreground shadow-md"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-5 w-5" /> Pausar
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" /> Reanudar
                </>
              )}
            </button>

            <button
              onClick={() => setSpeed((s) => (s === "slow" ? "normal" : "slow"))}
              className="tap-target border border-border bg-card px-4 py-2.5 text-base font-bold text-foreground hover:bg-muted"
            >
              Ritmo: {speed === "slow" ? "🐢 Lento y seguro" : "⚡ Normal"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl bg-warm-soft px-4 py-2 font-bold text-warm-foreground">
              <span className="text-xl">🔁</span>
              <span className="text-lg">
                Repeticiones: <strong className="text-2xl text-warm-foreground">{repCount}</strong>
              </span>
            </div>
            <button
              onClick={() => setRepCount((c) => c + 1)}
              title="Sumar 1 repetición"
              className="tap-target flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-base font-bold text-accent-foreground shadow hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> 1
            </button>
            <button
              onClick={() => setRepCount(0)}
              title="Reiniciar contador"
              className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pasos guiados y aviso de seguridad clínica */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card-surface p-4">
          <h4 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <Info className="h-5 w-5 text-primary" /> Cómo realizarlo paso a paso
          </h4>
          <ol className="mt-2.5 space-y-2 text-base text-muted-foreground">
            {currentExercise.steps.map((st, i) => (
              <li
                key={i}
                className={`flex items-start gap-2 rounded-lg p-1.5 transition-colors ${
                  viewMode === "animation" && i === activeStep
                    ? "bg-accent/20 font-bold text-foreground"
                    : ""
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span>{st}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="card-surface flex flex-col justify-between border-warm/40 bg-warm-soft/20 p-4">
          <div>
            <h4 className="flex items-center gap-2 font-display text-lg font-bold text-warm-foreground">
              <AlertTriangle className="h-5 w-5 text-warm" /> Seguridad y descanso
            </h4>
            <p className="mt-2 text-base font-semibold text-foreground">{currentExercise.safetyTip}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              ⚠️ Si experimenta mareo, dolor torácico o fatiga excesiva, detenga el ejercicio de
              inmediato y llame al personal de enfermería con el timbre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}