import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ExerciseType = "fuerza" | "movilidad" | "resistencia";
export type Intensity = "suave" | "moderada" | "vigorosa";
export type ProgressionPace = "gradual" | "estandar" | "mantenimiento" | "vigilada";

export type FittPlan = {
  patientName: string;
  room: string;
  daysPerWeek: number;
  sessionsPerDay: number;
  intensity: Intensity;
  minutes: number;
  type: ExerciseType;
  scheduleTime: string; // HH:MM
  // Factores FITT-VP (Volumen y Progresión):
  volumeWeeklyMinutes?: number;
  progressionPace?: ProgressionPace;
  progressionNotes?: string;
};

export const progressionLabels: Record<ProgressionPace, { label: string; desc: string }> = {
  gradual: {
    label: "Gradual (Adaptación)",
    desc: "+2 min cada 1 a 2 semanas según tolerancia cardiovascular y articular",
  },
  estandar: {
    label: "Estándar (Semanal)",
    desc: "+3 a 5 min o +1 día por semana si la adherencia es ≥80% y Borg es normal",
  },
  mantenimiento: {
    label: "Mantenimiento",
    desc: "Mantener dosis actual para consolidación y prevención de fatiga",
  },
  vigilada: {
    label: "Supervisada / Asistida",
    desc: "Avanzar únicamente con acompañamiento de fisioterapia o enfermería",
  },
};

export const calculateWeeklyVolume = (plan: {
  daysPerWeek?: number;
  sessionsPerDay?: number;
  minutes?: number;
}) => {
  return (plan.daysPerWeek || 0) * (plan.sessionsPerDay || 0) * (plan.minutes || 0);
};

export type Borg = "facil" | "normal" | "cansado" | "agotado";
export type SkipReason = "dolor" | "cansancio" | "procedimiento" | "singanas";

export type DayLog = {
  date: string; // YYYY-MM-DD
  done: boolean;
  borg?: Borg;
  reason?: SkipReason;
};

export type Patient = {
  id: string;
  age: number;
  diagnosis: string;
  plan: FittPlan;
  logs: DayLog[];
};

export type AppState = {
  patients: Patient[];
  selectedId: string;
};

const SELECTED_KEY = "movilidad-hospital-selected";

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const emptyPlan: FittPlan = {
  patientName: "Paciente",
  room: "",
  daysPerWeek: 5,
  sessionsPerDay: 1,
  intensity: "moderada",
  minutes: 10,
  type: "movilidad",
  scheduleTime: "09:00",
  volumeWeeklyMinutes: 50,
  progressionPace: "gradual",
  progressionNotes: "Aumento progresivo según tolerancia",
};

const placeholder: Patient = {
  id: "",
  age: 0,
  diagnosis: "",
  plan: emptyPlan,
  logs: [],
};

const initialState: AppState = { patients: [], selectedId: "" };

const listeners = new Set<(s: AppState) => void>();
let current: AppState = initialState;
let loadStarted = false;
let hasFetched = false;

function emit(next: AppState) {
  current = next;
  listeners.forEach((l) => l(next));
}

async function fetchAll(): Promise<AppState> {
  const [{ data: rows }, { data: logRows }] = await Promise.all([
    supabase.from("patients").select("*").order("created_at", { ascending: true }),
    supabase.from("activity_logs").select("*").order("log_date", { ascending: true }),
  ]);

  const patients: Patient[] = (rows ?? []).map((r) => {
    let vpParsed: { progressionPace?: ProgressionPace; progressionNotes?: string } = {};
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(`fitt_vp_${r.id}`);
        if (stored) vpParsed = JSON.parse(stored);
      } catch {
        /* ignore */
      }
    }

    return {
      id: r.id,
      age: r.age,
      diagnosis: r.diagnosis,
      plan: {
        patientName: r.patient_name,
        room: r.room,
        daysPerWeek: r.days_per_week,
        sessionsPerDay: r.sessions_per_day,
        intensity: r.intensity as Intensity,
        minutes: r.minutes,
        type: r.exercise_type as ExerciseType,
        scheduleTime: r.schedule_time,
        volumeWeeklyMinutes: r.days_per_week * r.sessions_per_day * r.minutes,
        progressionPace: vpParsed.progressionPace || "gradual",
        progressionNotes: vpParsed.progressionNotes || "Aumento gradual (+2 min/semana)",
      },
      logs: (logRows ?? [])
        .filter((l) => l.patient_id === r.id)
        .map((l) => ({
          date: l.log_date,
          done: l.done,
          ...(l.borg ? { borg: l.borg as Borg } : {}),
          ...(l.reason ? { reason: l.reason as SkipReason } : {}),
        })),
    };
  });

  const stored =
    typeof window === "undefined" ? null : window.localStorage.getItem(SELECTED_KEY);
  const selectedId =
    stored && patients.some((p) => p.id === stored) ? stored : (patients[0]?.id ?? "");

  return { patients, selectedId };
}

async function refresh() {
  const next = await fetchAll();
  hasFetched = true;
  emit(next);
}

export function useAppState() {
  const [state, setState] = useState<AppState>(current);
  const [hydrated, setHydrated] = useState(hasFetched);

  useEffect(() => {
    const l = (s: AppState) => {
      setState(s);
      setHydrated(true);
    };
    listeners.add(l);
    if (!loadStarted) {
      loadStarted = true;
      void refresh();
    } else if (hasFetched) {
      l(current);
    }
    return () => {
      listeners.delete(l);
    };
  }, []);

  const patient = useMemo(
    () => state.patients.find((p) => p.id === state.selectedId) ?? state.patients[0] ?? placeholder,
    [state],
  );

  const selectPatient = useCallback((id: string) => {
    if (typeof window !== "undefined") window.localStorage.setItem(SELECTED_KEY, id);
    emit({ ...current, selectedId: id });
  }, []);

  const setPlan = useCallback((plan: Partial<FittPlan>) => {
    const id = current.selectedId;
    if (!id) return;

    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(`fitt_vp_${id}`);
        const parsed = stored ? JSON.parse(stored) : {};
        if (plan.progressionPace !== undefined) parsed.progressionPace = plan.progressionPace;
        if (plan.progressionNotes !== undefined) parsed.progressionNotes = plan.progressionNotes;
        window.localStorage.setItem(`fitt_vp_${id}`, JSON.stringify(parsed));
      } catch {
        /* ignore */
      }
    }

    emit({
      ...current,
      patients: current.patients.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p.plan, ...plan };
        const volume = calculateWeeklyVolume(updated);
        return {
          ...p,
          plan: {
            ...updated,
            volumeWeeklyMinutes: volume,
          },
        };
      }),
    });
    const patch: {
      patient_name?: string;
      room?: string;
      days_per_week?: number;
      sessions_per_day?: number;
      intensity?: string;
      minutes?: number;
      exercise_type?: string;
      schedule_time?: string;
    } = {};
    if (plan.patientName !== undefined) patch.patient_name = plan.patientName;
    if (plan.room !== undefined) patch.room = plan.room;
    if (plan.daysPerWeek !== undefined) patch.days_per_week = plan.daysPerWeek;
    if (plan.sessionsPerDay !== undefined) patch.sessions_per_day = plan.sessionsPerDay;
    if (plan.intensity !== undefined) patch.intensity = plan.intensity;
    if (plan.minutes !== undefined) patch.minutes = plan.minutes;
    if (plan.type !== undefined) patch.exercise_type = plan.type;
    if (plan.scheduleTime !== undefined) patch.schedule_time = plan.scheduleTime;
    if (Object.keys(patch).length === 0) return;
    void supabase.from("patients").update(patch).eq("id", id).then(({ error }) => {
      if (error) console.error("No se pudo guardar el plan", error);
    });
  }, []);

  const logToday = useCallback((entry: Omit<DayLog, "date">) => {
    const id = current.selectedId;
    if (!id) return;
    const date = todayKey();
    emit({
      ...current,
      patients: current.patients.map((p) =>
        p.id === id
          ? { ...p, logs: [...p.logs.filter((l) => l.date !== date), { date, ...entry }] }
          : p,
      ),
    });
    void supabase
      .from("activity_logs")
      .upsert(
        {
          patient_id: id,
          log_date: date,
          done: entry.done,
          borg: entry.borg ?? null,
          reason: entry.reason ?? null,
        },
        { onConflict: "patient_id,log_date" },
      )
      .then(({ error }) => {
        if (error) console.error("No se pudo guardar el registro", error);
      });
  }, []);

  const reset = useCallback(() => {
    void refresh();
  }, []);

  const createPatient = useCallback(
    async (input: { patientName: string; age: number; diagnosis: string; room: string }) => {
      const { data, error } = await supabase
        .from("patients")
        .insert({
          patient_name: input.patientName,
          age: input.age,
          diagnosis: input.diagnosis,
          room: input.room,
        })
        .select("id")
        .single();
      if (error || !data) throw new Error("No se pudo crear el paciente");
      await refresh();
      if (typeof window !== "undefined") window.localStorage.setItem(SELECTED_KEY, data.id);
      emit({ ...current, selectedId: data.id });
      return data.id;
    },
    [],
  );

  const deletePatient = useCallback(async (id: string) => {
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) throw new Error("No se pudo eliminar el paciente");
    await refresh();
  }, []);

  return {
    state,
    patients: state.patients,
    patient,
    plan: patient.plan,
    logs: patient.logs,
    hydrated,
    selectPatient,
    setPlan,
    logToday,
    reset,
    createPatient,
    deletePatient,
  };
}

export function streakOf(logs: DayLog[]) {
  const map = new Map(logs.map((l) => [l.date, l]));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const entry = map.get(key);
    if (entry?.done) streak++;
    else if (i > 0 || entry) break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function adherence(logs: DayLog[], days = 7) {
  const recent = logs.slice(-days);
  if (recent.length === 0) return 0;
  return Math.round((recent.filter((l) => l.done).length / recent.length) * 100);
}

export const borgLabels: Record<Borg, { emoji: string; label: string }> = {
  facil: { emoji: "😀", label: "Súper fácil" },
  normal: { emoji: "🙂", label: "Normal" },
  cansado: { emoji: "😓", label: "Cansado" },
  agotado: { emoji: "😫", label: "Muy agotado" },
};

export const reasonLabels: Record<SkipReason, string> = {
  dolor: "Dolor",
  cansancio: "Cansancio",
  procedimiento: "Procedimiento médico",
  singanas: "Sin ganas",
};

export const typeLabels: Record<ExerciseType, string> = {
  fuerza: "Fuerza",
  movilidad: "Movilidad",
  resistencia: "Resistencia",
};

export const intensityLabels: Record<Intensity, string> = {
  suave: "Suave",
  moderada: "Moderada",
  vigorosa: "Vigorosa",
};
