import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  Zap,
  Flame,
  ArrowRight,
  HeartPulse,
  Scale,
  Calendar,
  Clock,
  Dumbbell,
  HelpCircle,
  Play,
  RotateCcw,
  Volume2,
} from "lucide-react";

export const Route = createFileRoute("/plan-individual")({
  head: () => ({
    meta: [
      { title: "Plan Individual Multinivel · Movilidad y Vitalidad" },
      {
        name: "description",
        content:
          "Programa de actividad física multinivel FITT-VP para personas en su hogar o recuperación ambulatoria. Adquiere tu plan personalizado.",
      },
      { property: "og:title", content: "Plan Individual Multinivel · Movilidad y Vitalidad" },
    ],
  }),
  component: IndividualPlanPage,
});

type LevelId = "nivel-1" | "nivel-2" | "nivel-3";

type LevelData = {
  id: LevelId;
  name: string;
  badge: string;
  tagline: string;
  targetUser: string;
  fittVp: {
    frecuencia: string;
    intensidad: string;
    tiempo: string;
    tipo: string;
    volumenSemanalMin: number;
    progresion: string;
  };
  routineExercises: {
    name: string;
    duration: string;
    desc: string;
    image: string;
  }[];
};

const LEVELS: Record<LevelId, LevelData> = {
  "nivel-1": {
    id: "nivel-1",
    name: "Nivel 1: Adaptación y Autonomía",
    badge: "Principiante / Hogar",
    tagline: "Para personas iniciando actividad, convalecientes o con movilidad reducida.",
    targetUser: "Ideal si requiere apoyos ocasionales y busca recuperar seguridad para levantarse y caminar.",
    fittVp: {
      frecuencia: "3 a 4 días por semana",
      intensidad: "Suave a moderada (Borg 2-3)",
      tiempo: "15 a 20 minutos por sesión",
      tipo: "Movilidad articular + Fuerza en silla + Equilibrio con apoyo",
      volumenSemanalMin: 70,
      progresion: "Aumento de 2 minutos semanales al completar 2 semanas sin fatiga residual.",
    },
    routineExercises: [
      {
        name: "Bombeo de tobillos y pies",
        duration: "3 minutos",
        desc: "Activa la bomba muscular de las pantorrillas y previene hinchazón.",
        image: "/exercises/ankle-pump.jpg",
      },
      {
        name: "Sentarse y levantarse con apoyabrazos",
        duration: "6 minutos (8-10 reps)",
        desc: "Fortalece cuádriceps y glúteos para ganar independencia al levantarse.",
        image: "/exercises/sit-to-stand.jpg",
      },
      {
        name: "Apertura de pecho y respiración",
        duration: "4 minutos",
        desc: "Expande la caja torácica, mejora la oxigenación y la postura erguida.",
        image: "/exercises/shoulder-chest.jpg",
      },
      {
        name: "Marcha suave en el sitio con apoyo",
        duration: "5 minutos",
        desc: "Mantiene la coordinación de pasos con apoyo firme de silla o andador.",
        image: "/exercises/marching-support.jpg",
      },
    ],
  },
  "nivel-2": {
    id: "nivel-2",
    name: "Nivel 2: Fuerza Funcional & Equilibrio",
    badge: "Intermedio / Vida Activa",
    tagline: "Para consolidar independencia, subir escaleras con firmeza y prevenir caídas.",
    targetUser: "Para adultos independientes que desean más energía diaria, equilibrio y fuerza en piernas.",
    fittVp: {
      frecuencia: "4 a 5 días por semana",
      intensidad: "Moderada (Borg 4-5)",
      tiempo: "25 a 30 minutos por sesión",
      tipo: "Fuerza funcional + Marcha rítmica + Equilibrio tándem",
      volumenSemanalMin: 130,
      progresion: "Transición a sit-to-stand sin manos y aumento de series cada 3 semanas.",
    },
    routineExercises: [
      {
        name: "Sit-to-Stand con brazos al pecho",
        duration: "8 minutos (3 series de 10 reps)",
        desc: "Desarrolla fuerza potente de piernas sin depender de los apoyabrazos.",
        image: "/exercises/sit-to-stand.jpg",
      },
      {
        name: "Extensión de rodilla sostenida (3s)",
        duration: "6 minutos",
        desc: "Tonifica los cuádriceps para dar estabilidad a las rodillas en escaleras.",
        image: "/exercises/knee-extension.jpg",
      },
      {
        name: "Puntillas y equilibrio dinámico",
        duration: "5 minutos (12 reps)",
        desc: "Refuerza tobillos y gemelos para mantener estabilidad en terrenos irregulares.",
        image: "/exercises/heel-rises.jpg",
      },
      {
        name: "Caminata rítmica continua en casa",
        duration: "10 minutos",
        desc: "Acondicionamiento aeróbico para resistencia cardiorrespiratoria.",
        image: "/exercises/marching-support.jpg",
      },
    ],
  },
  "nivel-3": {
    id: "nivel-3",
    name: "Nivel 3: Vitalidad, Resistencia & Longevidad",
    badge: "Avanzado / Plena Autonomía",
    tagline: "Para maximizar la capacidad cardiopulmonar, agilidad y vigor diario.",
    targetUser: "Para personas activas que desean envejecer con máxima plenitud, salir a caminar y viajar.",
    fittVp: {
      frecuencia: "5 días por semana",
      intensidad: "Moderada a vigorosa controlada (Borg 6-7)",
      tiempo: "35 a 45 minutos por sesión",
      tipo: "Fuerza con autocarga + Circuito aeróbico + Agilidad multidireccional",
      volumenSemanalMin: 180,
      progresion: "Cumplimiento del objetivo internacional de la OMS (>150 min/sem) con sobrecarga periódica.",
    },
    routineExercises: [
      {
        name: "Sentadillas libres profundas y controladas",
        duration: "10 minutos (3 series de 12 reps)",
        desc: "Fuerza máxima funcional de piernas y estabilidad de cadera.",
        image: "/exercises/sit-to-stand.jpg",
      },
      {
        name: "Marcha rápida y pasos multidireccionales",
        duration: "12 minutos",
        desc: "Mejora el tiempo de reacción, agilidad y reflejos protectores de equilibrio.",
        image: "/exercises/marching-support.jpg",
      },
      {
        name: "Fuerza y movilidad torácica activa",
        duration: "8 minutos",
        desc: "Apertura escapular y fuerza de tronco para cargar objetos cotidianos.",
        image: "/exercises/shoulder-chest.jpg",
      },
      {
        name: "Elevación de talones unipodal (alternada)",
        duration: "6 minutos",
        desc: "Fortalece cada pierna de manera individual para máxima seguridad en la marcha.",
        image: "/exercises/heel-rises.jpg",
      },
    ],
  },
};

export function IndividualPlanPage() {
  const [activeLevel, setActiveLevel] = useState<LevelId>("nivel-2");
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<{ name: string; price: string } | null>(null);

  // Respuestas del cuestionario para cálculo de nivel
  const [q1, setQ1] = useState<number | null>(null); // Sentarse y pararse
  const [q2, setQ2] = useState<number | null>(null); // Caminar continuo
  const [q3, setQ3] = useState<number | null>(null); // Tropiezos / caídas
  const [quizResult, setQuizResult] = useState<LevelId | null>(null);

  // Registro de rutina personal completada hoy
  const [completedToday, setCompletedToday] = useState(false);
  const [streakDays, setStreakDays] = useState(3);

  // Cargar nivel guardado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLevel = window.localStorage.getItem("plan_individual_level") as LevelId | null;
      if (savedLevel && LEVELS[savedLevel]) {
        setActiveLevel(savedLevel);
      }
      const savedStreak = window.localStorage.getItem("plan_individual_streak");
      if (savedStreak) setStreakDays(Number(savedStreak));
    }
  }, []);

  const handleSelectLevel = (level: LevelId) => {
    setActiveLevel(level);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("plan_individual_level", level);
    }
  };

  const handleCalculateQuiz = () => {
    if (q1 === null || q2 === null || q3 === null) return;
    const score = q1 + q2 + q3;
    let recommended: LevelId = "nivel-1";
    if (score >= 6) recommended = "nivel-3";
    else if (score >= 3) recommended = "nivel-2";

    setQuizResult(recommended);
    setActiveLevel(recommended);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("plan_individual_level", recommended);
    }
  };

  const handleCompleteRoutine = () => {
    setCompletedToday(true);
    const newStreak = streakDays + 1;
    setStreakDays(newStreak);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("plan_individual_streak", String(newStreak));
    }
  };

  const currentLevelData = LEVELS[activeLevel];

  return (
    <div className="space-y-8">
      {/* Hero Banner: B2C Plan Individual */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-accent p-6 text-primary-foreground sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-sm font-bold backdrop-blur">
            <Sparkles className="h-4 w-4 text-warm" /> Programa Personal de Movilidad y Vitalidad
          </span>
          <h1 className="font-display text-3xl font-extrabold sm:text-5xl leading-tight">
            Plan Individual de Actividad Física Multinivel
          </h1>
          <p className="text-lg text-primary-foreground/90 sm:text-xl">
            Diseñado para personas en su hogar o recuperación ambulatoria. Basado en el estándar
            médico <strong>FITT-VP</strong> (Frecuencia, Intensidad, Tiempo, Tipo, Volumen y
            Progresión).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setShowQuiz(true)}
              className="tap-target flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-lg font-bold text-primary shadow-lg hover:bg-white/90"
            >
              <HelpCircle className="h-5 w-5" /> ¿Cuál es mi nivel ideal? (Test 1 min)
            </button>
            <button
              onClick={() => {
                setSelectedPlanPrice({ name: "Plan Vitalidad Pro", price: "$39 / mes" });
                setShowCheckout(true);
              }}
              className="tap-target flex items-center gap-2 rounded-2xl border-2 border-white/50 bg-white/10 px-6 py-3.5 text-lg font-bold text-white backdrop-blur hover:bg-white/20"
            >
              <Award className="h-5 w-5" /> Ver planes de compra
            </button>
          </div>
        </div>

        {/* Insignia de racha en vivo */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/20 pt-4 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-warm" />
            <span>Racha activa: <strong>{streakDays} días consecutivos</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <span>Certificado según guías del Colegio Americano de Medicina del Deporte (ACSM)</span>
          </div>
        </div>
      </section>

      {/* Modal / Acordeón: Test de Nivel Rápido */}
      {showQuiz && (
        <section className="card-surface p-6 sm:p-8 space-y-6 border-2 border-primary/40 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Descubre tu Nivel Ideal</h2>
              <p className="text-muted-foreground">Responde 3 preguntas sencillas sobre tu movilidad habitual.</p>
            </div>
            <button
              onClick={() => setShowQuiz(false)}
              className="rounded-xl border border-border px-3 py-1.5 text-sm font-bold text-muted-foreground hover:bg-muted"
            >
              Cerrar
            </button>
          </div>

          <div className="space-y-4">
            {/* Pregunta 1 */}
            <div className="space-y-2">
              <label className="block text-base font-bold text-foreground">
                1. ¿Cómo te sientes al levantarte de una silla común?
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { text: "Necesito usar los brazos y esfuerzo", val: 0 },
                  { text: "Uso los brazos pero con facilidad", val: 1 },
                  { text: "Me levanto sin usar las manos fácilmente", val: 2 },
                ].map((op) => (
                  <button
                    key={op.val}
                    onClick={() => setQ1(op.val)}
                    className={`rounded-xl border-2 p-3 text-left text-sm font-bold transition-all ${
                      q1 === op.val
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {op.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Pregunta 2 */}
            <div className="space-y-2">
              <label className="block text-base font-bold text-foreground">
                2. ¿Cuánto tiempo puedes caminar continuamente sin tener que detenerte por fatiga?
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { text: "Menos de 10 minutos", val: 0 },
                  { text: "Entre 15 y 25 minutos", val: 1 },
                  { text: "Más de 30 minutos sin problema", val: 2 },
                ].map((op) => (
                  <button
                    key={op.val}
                    onClick={() => setQ2(op.val)}
                    className={`rounded-xl border-2 p-3 text-left text-sm font-bold transition-all ${
                      q2 === op.val
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {op.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Pregunta 3 */}
            <div className="space-y-2">
              <label className="block text-base font-bold text-foreground">
                3. ¿Has tenido tropiezos, pérdidas de equilibrio o caídas en los últimos 6 meses?
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { text: "Sí, me siento con temor al caminar", val: 0 },
                  { text: "Rara vez o solo tropiezos menores", val: 1 },
                  { text: "No, me siento con equilibrio firme", val: 2 },
                ].map((op) => (
                  <button
                    key={op.val}
                    onClick={() => setQ3(op.val)}
                    className={`rounded-xl border-2 p-3 text-left text-sm font-bold transition-all ${
                      q3 === op.val
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {op.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
            <button
              onClick={handleCalculateQuiz}
              disabled={q1 === null || q2 === null || q3 === null}
              className="tap-target bg-primary px-6 py-3.5 text-lg font-bold text-primary-foreground disabled:opacity-50"
            >
              Calcular mi nivel recomendado
            </button>

            {quizResult && (
              <div className="rounded-2xl bg-accent-soft px-4 py-2 text-accent-foreground font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span>Nivel recomendado: <strong>{LEVELS[quizResult].name}</strong></span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Selector de Nivel (Tabs de Navegación Multinivel) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Selecciona tu Nivel de Entrenamiento
            </h2>
            <p className="text-base text-muted-foreground">
              Puedes cambiar de nivel en cualquier momento según tu evolución y tolerancia.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(LEVELS) as LevelId[]).map((lvlKey) => {
            const lvl = LEVELS[lvlKey];
            const isSelected = lvl.id === activeLevel;
            return (
              <button
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl.id)}
                className={`card-surface flex flex-col justify-between p-5 text-left transition-all ${
                  isSelected
                    ? "border-2 border-primary bg-primary-soft/30 shadow-lg ring-2 ring-primary ring-offset-2"
                    : "hover:border-primary/50"
                }`}
              >
                <div>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {lvl.badge}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold text-foreground">{lvl.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{lvl.tagline}</p>
                </div>

                <div className="mt-4 border-t border-border/60 pt-3 text-xs font-bold text-primary flex items-center justify-between">
                  <span>Volumen: {lvl.fittVp.volumenSemanalMin} min/sem</span>
                  <span>{isSelected ? "Activo ✓" : "Seleccionar →"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tarjeta de Prescripción FITT-VP del Nivel Activo */}
      <section className="card-surface p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
              Prescripción Clínica del Nivel Activo
            </span>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Fórmula FITT-VP: {currentLevelData.name}
            </h2>
            <p className="text-base text-muted-foreground mt-1">{currentLevelData.targetUser}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-warm-soft px-4 py-3 text-center">
              <p className="text-2xl font-extrabold text-warm-foreground">
                {currentLevelData.fittVp.volumenSemanalMin}
              </p>
              <p className="text-xs font-bold text-warm-foreground uppercase">minutos / semana (V)</p>
            </div>
          </div>
        </div>

        {/* Grilla FITT-VP detallada */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* F */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-extrabold text-primary flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> [F] FRECUENCIA
            </p>
            <p className="mt-1 font-display text-lg font-bold">{currentLevelData.fittVp.frecuencia}</p>
            <p className="mt-1 text-xs text-muted-foreground">Distribución óptima para evitar fatiga.</p>
          </div>

          {/* I */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-extrabold text-accent flex items-center gap-1.5">
              <HeartPulse className="h-4 w-4" /> [I] INTENSIDAD
            </p>
            <p className="mt-1 font-display text-lg font-bold">{currentLevelData.fittVp.intensidad}</p>
            <p className="mt-1 text-xs text-muted-foreground">Permite hablar durante el ejercicio.</p>
          </div>

          {/* T */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-extrabold text-warm flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> [T] TIEMPO
            </p>
            <p className="mt-1 font-display text-lg font-bold">{currentLevelData.fittVp.tiempo}</p>
            <p className="mt-1 text-xs text-muted-foreground">Incluye calentamiento y vuelta a la calma.</p>
          </div>

          {/* T */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-extrabold text-primary flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4" /> [T] TIPO DE ACTIVIDAD
            </p>
            <p className="mt-1 font-display text-lg font-bold">{currentLevelData.fittVp.tipo}</p>
            <p className="mt-1 text-xs text-muted-foreground">Combinación multicomponente recomendada.</p>
          </div>

          {/* V */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-extrabold text-accent flex items-center gap-1.5">
              <Scale className="h-4 w-4" /> [V] VOLUMEN ACUMULADO
            </p>
            <p className="mt-1 font-display text-lg font-bold">
              {currentLevelData.fittVp.volumenSemanalMin} min semanales
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-accent"
                style={{
                  width: `${Math.min(100, (currentLevelData.fittVp.volumenSemanalMin / 150) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {currentLevelData.fittVp.volumenSemanalMin >= 150
                ? "Cumple la recomendación global OMS"
                : "Etapa de acondicionamiento progresivo"}
            </p>
          </div>

          {/* P */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-extrabold text-warm flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> [P] MODELO DE PROGRESIÓN
            </p>
            <p className="mt-1 font-display text-sm font-bold text-foreground">
              {currentLevelData.fittVp.progresion}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Avance seguro sin sobrecargar articulaciones.</p>
          </div>
        </div>
      </section>

      {/* Rutina del Día para el Usuario */}
      <section className="card-surface p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Rutina Guiada de Hoy · {currentLevelData.name.split(":")[1]}
            </h2>
            <p className="text-muted-foreground">
              Realiza cada ejercicio a tu ritmo. Tómate descansos de 30 a 60 segundos entre bloques.
            </p>
          </div>

          <button
            onClick={handleCompleteRoutine}
            disabled={completedToday}
            className={`tap-target flex items-center gap-2 rounded-2xl px-6 py-3.5 text-lg font-bold shadow-md transition-all ${
              completedToday
                ? "bg-accent text-accent-foreground opacity-90 cursor-default"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            {completedToday ? "¡Rutina de hoy completada! 🎉" : "Marcar rutina como completada"}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {currentLevelData.routineExercises.map((ex, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="relative h-44 w-full bg-muted">
                <img src={ex.image} alt={ex.name} className="h-full w-full object-cover" />
                <span className="absolute bottom-2 left-2 rounded-lg bg-black/75 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                  Paso {i + 1} · {ex.duration}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-display text-lg font-bold text-foreground">{ex.name}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{ex.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de Compra y Suscripción B2C */}
      <section id="comprar" className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-block rounded-full bg-accent/20 px-4 py-1 text-xs font-bold text-accent-foreground uppercase tracking-wider">
            Planes de Suscripción para Usuarios y Familias
          </span>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Adquiere tu Plan Individual con Acompañamiento
          </h2>
          <p className="text-lg text-muted-foreground">
            Invierte en salud, independencia y movilidad diaria con respaldo profesional.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
          {/* Plan 1: Esencial */}
          <div className="card-surface p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h3 className="font-display text-xl font-bold">Plan Esencial</h3>
              <p className="text-sm text-muted-foreground">Para quienes desean entrenar por su cuenta con guía digital.</p>
              <div className="pt-2">
                <span className="text-4xl font-extrabold text-foreground">$19</span>
                <span className="text-muted-foreground"> / mes</span>
              </div>
              <ul className="space-y-2 text-sm text-foreground pt-3">
                <li className="flex items-center gap-2">✓ Rutinas multinivel (Nivel 1, 2 y 3)</li>
                <li className="flex items-center gap-2">✓ Alarma con voz motivacional</li>
                <li className="flex items-center gap-2">✓ Contador de racha y repeticiones</li>
                <li className="flex items-center gap-2">✓ Guía respiratoria en pantalla</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanPrice({ name: "Plan Esencial", price: "$19 / mes" });
                setShowCheckout(true);
              }}
              className="tap-target w-full rounded-2xl border-2 border-primary bg-card py-3 text-base font-bold text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Comenzar prueba (7 días gratis)
            </button>
          </div>

          {/* Plan 2: Pro Vitalidad (Destacado) */}
          <div className="card-surface p-6 flex flex-col justify-between space-y-6 border-2 border-primary bg-primary-soft/20 shadow-xl relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-extrabold text-primary-foreground shadow">
              MÁS POPULAR
            </span>
            <div className="space-y-3">
              <h3 className="font-display text-2xl font-bold text-primary">Vitalidad Pro</h3>
              <p className="text-sm text-muted-foreground">Acompañamiento clínico para maximizar resultados.</p>
              <div className="pt-2">
                <span className="text-4xl font-extrabold text-foreground">$39</span>
                <span className="text-muted-foreground"> / mes</span>
              </div>
              <ul className="space-y-2 text-sm text-foreground pt-3">
                <li className="flex items-center gap-2 font-bold">✓ Todo lo del Plan Esencial</li>
                <li className="flex items-center gap-2">✓ Ajuste mensual FITT-VP por fisioterapeuta</li>
                <li className="flex items-center gap-2">✓ Informe mensual clínico en PDF para su médico</li>
                <li className="flex items-center gap-2">✓ Soporte por WhatsApp para dudas</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanPrice({ name: "Plan Vitalidad Pro", price: "$39 / mes" });
                setShowCheckout(true);
              }}
              className="tap-target w-full rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground shadow-md hover:bg-primary/90"
            >
              Elegir Vitalidad Pro →
            </button>
          </div>

          {/* Plan 3: Familiar Anual */}
          <div className="card-surface p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="inline-block rounded-full bg-warm-soft px-3 py-1 text-xs font-bold text-warm-foreground">
                Ahorra 40%
              </span>
              <h3 className="font-display text-xl font-bold">Plan Familiar Anual</h3>
              <p className="text-sm text-muted-foreground">Tranquilidad y salud para hasta 3 familiares en casa.</p>
              <div className="pt-2">
                <span className="text-4xl font-extrabold text-foreground">$149</span>
                <span className="text-muted-foreground"> / año</span>
              </div>
              <ul className="space-y-2 text-sm text-foreground pt-3">
                <li className="flex items-center gap-2">✓ Hasta 3 usuarios independientes</li>
                <li className="flex items-center gap-2">✓ Alertas de inactividad para familiares</li>
                <li className="flex items-center gap-2">✓ Llamada trimestral con especialista</li>
                <li className="flex items-center gap-2">✓ Acceso ilimitado a todas las actualizaciones</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setSelectedPlanPrice({ name: "Plan Familiar Anual", price: "$149 / año" });
                setShowCheckout(true);
              }}
              className="tap-target w-full rounded-2xl border-2 border-border bg-card py-3 text-base font-bold text-foreground hover:bg-muted"
            >
              Elegir Plan Familiar
            </button>
          </div>
        </div>
      </section>

      {/* Modal de Pago / Activación Simulado */}
      {showCheckout && selectedPlanPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="card-surface max-w-lg w-full p-6 sm:p-8 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display text-2xl font-bold">Activar {selectedPlanPrice.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedPlanPrice.price} · 7 días de prueba sin compromiso</p>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`¡Gracias! Se ha activado tu suscripción a ${selectedPlanPrice.name}. Recibirás un correo con tus credenciales y acceso a tu fisioterapeuta.`);
                setShowCheckout(false);
              }}
              className="space-y-3 pt-2"
            >
              <label className="block text-sm font-bold">
                Nombre completo del usuario / familiar
                <input
                  required
                  placeholder="Ej. Carmen Rodríguez"
                  className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-2.5 text-base"
                />
              </label>

              <label className="block text-sm font-bold">
                Correo electrónico
                <input
                  required
                  type="email"
                  placeholder="carmen@ejemplo.com"
                  className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-2.5 text-base"
                />
              </label>

              <label className="block text-sm font-bold">
                Teléfono WhatsApp (para recordatorios y soporte)
                <input
                  required
                  placeholder="+57 300 123 4567"
                  className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-2.5 text-base"
                />
              </label>

              <div className="rounded-xl bg-accent-soft/30 p-3 text-xs text-foreground">
                🔒 Pago protegido con encriptación de 256 bits. No se te cobrará nada durante los primeros 7 días.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="tap-target flex-1 rounded-xl border border-border bg-card text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="tap-target flex-1 rounded-xl bg-primary text-primary-foreground font-bold shadow-md"
                >
                  Confirmar y Activar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
