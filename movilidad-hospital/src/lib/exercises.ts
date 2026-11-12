import type { ExerciseType } from "./plan-store";

export type ExerciseDetail = {
  id: string;
  type: ExerciseType;
  name: string;
  shortName: string;
  position: string;
  clinicalTarget: string;
  durationOrReps: string;
  cycleDurationSec: number;
  steps: string[];
  breathingInhale: string;
  breathingExhale: string;
  safetyTip: string;
  image: string;
};

export const CLINICAL_EXERCISES: Record<ExerciseType, ExerciseDetail[]> = {
  fuerza: [
    {
      id: "sit-to-stand",
      type: "fuerza",
      name: "Sentarse y levantarse (Sit-to-Stand)",
      shortName: "Levantarse de la silla",
      position: "En silla con apoyabrazos",
      clinicalTarget: "Fuerza en cuádriceps, glúteos y prevención de caídas",
      durationOrReps: "10 repeticiones",
      cycleDurationSec: 4.5,
      image: "/exercises/sit-to-stand.jpg",
      steps: [
        "Apoye ambos pies en el suelo, separados al ancho de hombros.",
        "Inclínese suavemente hacia adelante desde la cadera.",
        "Empuje con fuerza desde los talones y póngase de pie con control.",
        "Haga una pausa de 1 segundo de pie y vuelva a sentarse despacio.",
      ],
      breathingInhale: "Inhale al prepararse y al sentarse",
      breathingExhale: "Exhale al levantarse con fuerza",
      safetyTip: "Asegúrese de que la silla sea fija y esté bien apoyada.",
    },
    {
      id: "knee-extension",
      type: "fuerza",
      name: "Extensión de rodilla en silla",
      shortName: "Extensión de pierna",
      position: "Sentado erguido",
      clinicalTarget: "Fortalecimiento de cuádriceps para volver a caminar",
      durationOrReps: "8 - 10 reps por pierna",
      cycleDurationSec: 3.6,
      image: "/exercises/knee-extension.jpg",
      steps: [
        "Espalda recta apoyada en el respaldo de la silla.",
        "Extienda una pierna hacia adelante hasta dejarla recta.",
        "Mantenga la pierna en el aire durante 2 segundos con la punta del pie hacia arriba.",
        "Baje lentamente y repita con la otra pierna.",
      ],
      breathingInhale: "Inhale mientras la pierna baja",
      breathingExhale: "Exhale mientras estira la pierna hacia adelante",
      safetyTip: "No arquee la espalda baja al levantar la pierna.",
    },
    {
      id: "bicep-curl",
      type: "fuerza",
      name: "Flexión y elevación de brazos",
      shortName: "Fuerza de brazos",
      position: "Sentado o al borde de la cama",
      clinicalTarget: "Fuerza en extremidades superiores para apoyos y transferencias",
      durationOrReps: "10 repeticiones",
      cycleDurationSec: 3.2,
      image: "/exercises/shoulder-chest.jpg",
      steps: [
        "Brazos al costado del cuerpo con puños suaves o botellita de agua.",
        "Doble los codos llevando las manos hacia los hombros.",
        "Eleve suavemente los codos al frente a la altura del pecho.",
        "Descienda de forma controlada hasta la posición inicial.",
      ],
      breathingInhale: "Inhale al descender los brazos",
      breathingExhale: "Exhale al flexionar y subir",
      safetyTip: "Mantenga los hombros relajados, sin tensionar el cuello.",
    },
  ],
  movilidad: [
    {
      id: "ankle-pump",
      type: "movilidad",
      name: "Bombeo y flexión de tobillos",
      shortName: "Bombeo de tobillos",
      position: "En cama o silla con piernas estiradas",
      clinicalTarget: "Activación del retorno venoso y prevención de trombosis (TVP)",
      durationOrReps: "15 - 20 repeticiones",
      cycleDurationSec: 2.4,
      image: "/exercises/ankle-pump.jpg",
      steps: [
        "Estire las piernas con los talones apoyados.",
        "Lleve las puntas de los pies hacia arriba, apuntando hacia su cara.",
        "Ahora apunte con las puntas hacia adelante, como pisando el acelerador.",
        "Haga pequeños círculos con ambos pies en ambas direcciones.",
      ],
      breathingInhale: "Inhale al llevar la punta hacia usted",
      breathingExhale: "Exhale al apuntar la punta hacia adelante",
      safetyTip: "Excelente ejercicio para realizar a primera hora antes de levantarse.",
    },
    {
      id: "shoulder-chest",
      type: "movilidad",
      name: "Apertura de pecho y hombros",
      shortName: "Apertura de pecho",
      position: "Sentado erguido en silla",
      clinicalTarget: "Capacidad ventilatoria, expansión pulmonar y postura",
      durationOrReps: "8 - 10 repeticiones",
      cycleDurationSec: 4.0,
      image: "/exercises/shoulder-chest.jpg",
      steps: [
        "Junte las palmas de las manos frente a su pecho.",
        "Abra los brazos hacia los costados mientras infla el pecho de aire.",
        "Sienta cómo se juntan los omóplatos detrás.",
        "Cierre lentamente los brazos botando todo el aire.",
      ],
      breathingInhale: "Inhale hondo mientras abre los brazos al máximo",
      breathingExhale: "Exhale lento por la boca mientras junta las manos",
      safetyTip: "Respire a su propio ritmo sin forzar si siente molestia articular.",
    },
    {
      id: "trunk-rotation",
      type: "movilidad",
      name: "Giros suaves de tronco y cuello",
      shortName: "Giro de tronco",
      position: "Sentado firme",
      clinicalTarget: "Movilidad de columna dorsal y cuello para autonomía",
      durationOrReps: "6 giros a cada lado",
      cycleDurationSec: 4.2,
      image: "/exercises/shoulder-chest.jpg",
      steps: [
        "Cruce los brazos sobre el pecho con la espalda derecha.",
        "Gire suavemente los hombros y la cabeza hacia la derecha.",
        "Regrese al centro y gire suavemente hacia la izquierda.",
        "Mantenga la cadera y rodillas fijas apuntando al frente.",
      ],
      breathingInhale: "Inhale al volver al centro",
      breathingExhale: "Exhale suavemente al girar hacia un lado",
      safetyTip: "Gire solo hasta donde no cause molestia, sin tirones bruscos.",
    },
  ],
  resistencia: [
    {
      id: "marching-support",
      type: "resistencia",
      name: "Marcha en el sitio con apoyo",
      shortName: "Marcha con apoyo",
      position: "De pie sosteniéndose de baranda o respaldo de silla",
      clinicalTarget: "Capacidad cardiovascular, tolerancia ortostática y ritmo de marcha",
      durationOrReps: "1 a 3 minutos continuos",
      cycleDurationSec: 1.6,
      image: "/exercises/marching-support.jpg",
      steps: [
        "Sosténgase firmemente con ambas manos en el andador o respaldo de la silla.",
        "Levante la rodilla derecha de manera cómoda sin perder el equilibrio.",
        "Baje el pie y levante la rodilla izquierda alternadamente.",
        "Mantenga un ritmo constante y una respiración fluida.",
      ],
      breathingInhale: "Inhale en 2 pasos de marcha",
      breathingExhale: "Exhale en 2 pasos de marcha",
      safetyTip: "Mantenga siempre al menos una mano firme en el apoyo.",
    },
    {
      id: "heel-rises",
      type: "resistencia",
      name: "Elevación de talones (Puntillas)",
      shortName: "Puntillas con apoyo",
      position: "De pie frente a silla o andador",
      clinicalTarget: "Bomba muscular de pantorrilla y equilibrio dinámico",
      durationOrReps: "12 a 15 repeticiones",
      cycleDurationSec: 2.8,
      image: "/exercises/heel-rises.jpg",
      steps: [
        "Pies paralelos apoyados, manos en el respaldo de la silla.",
        "Elévese sobre las puntas de los pies despegando los talones.",
        "Mantenga 1 segundo arriba sintiendo la fuerza en las pantorrillas.",
        "Apoye lentamente los talones en el suelo.",
      ],
      breathingInhale: "Inhale al bajar los talones al piso",
      breathingExhale: "Exhale al subir sobre las puntas de pie",
      safetyTip: "No desplace el peso hacia atrás al apoyar los talones.",
    },
  ],
};
