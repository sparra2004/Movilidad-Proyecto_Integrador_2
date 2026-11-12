import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/guia")({
  head: () => ({
    meta: [
      { title: "Guía de instalación · Movilidad Hospitalaria" },
      {
        name: "description",
        content:
          "Guía paso a paso para instalar la app en los dispositivos del hospital, crear pacientes y prescribir planes FITT.",
      },
      { property: "og:title", content: "Guía de instalación · Movilidad Hospitalaria" },
      {
        property: "og:description",
        content: "Instale la app, registre pacientes reales y configure su plan de ejercicio.",
      },
    ],
  }),
  component: Guide,
});

const sections: { title: string; steps: string[] }[] = [
  {
    title: "1. Instalar la app en cada dispositivo",
    steps: [
      "Abra el enlace de la app en el navegador del dispositivo (tablet de habitación o celular del paciente).",
      "Android: toque el menú ⋮ de Chrome y elija “Instalar app” o “Agregar a pantalla de inicio”.",
      "iPhone / iPad: toque el botón Compartir de Safari y elija “Agregar a inicio”.",
      "Aparecerá el ícono “Movilidad” en la pantalla de inicio. Ábralo desde ahí: se verá a pantalla completa.",
      "Mantenga el dispositivo conectado a internet: los registros se guardan en línea.",
    ],
  },
  {
    title: "2. Crear un paciente real",
    steps: [
      "En el dispositivo del personal, vaya a “Pacientes”.",
      "Toque “＋ Nuevo paciente” y escriba nombre completo, edad, habitación y diagnóstico.",
      "Toque “Crear paciente”. La app abrirá directamente su plan FITT.",
    ],
  },
  {
    title: "3. Prescribir el plan FITT-VP",
    steps: [
      "Frecuencia: días por semana y sesiones por día.",
      "Intensidad: suave, moderada o vigorosa según la evaluación clínica.",
      "Tiempo: minutos por sesión.",
      "Tipo: fuerza, movilidad o resistencia, y la hora del aviso por voz.",
      "Volumen: dosis semanal acumulada (meta óptima: 150 min/semana).",
      "Progresión: ritmo de avance paulatino según tolerancia clínica y adherencia.",
    ],
  },
  {
    title: "4. Asignar el dispositivo al paciente",
    steps: [
      "En el dispositivo del paciente, abra “Personal de Salud” y toque su nombre para seleccionarlo.",
      "Luego vuelva a “Vista Paciente”: ese dispositivo quedará asignado a ese paciente.",
      "Explique al paciente: botón verde cuando termine, elegir una carita, o “Hoy no pude”.",
    ],
  },
  {
    title: "5. Seguimiento diario",
    steps: [
      "En “Personal de Salud” revise el semáforo: verde (bien), amarillo (vigilar), rojo (intervenir).",
      "Use “Generar resumen” para obtener un resumen clínico de adherencia, esfuerzo y motivos.",
      "Al dar de alta, elimine al paciente desde “Pacientes” para mantener la lista al día.",
    ],
  },
];

function Guide() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Guía para el hospital</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          Siga estos pasos para poner la app en marcha en su piso.
        </p>
      </div>
      {sections.map((s) => (
        <section key={s.title} className="card-surface p-6">
          <h2 className="font-display text-2xl font-bold">{s.title}</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-lg">
            {s.steps.map((st) => (
              <li key={st}>{st}</li>
            ))}
          </ol>
        </section>
      ))}
      <Link
        to="/pacientes"
        className="tap-target flex w-full items-center justify-center bg-primary py-5 text-xl text-primary-foreground"
      >
        Empezar: crear el primer paciente
      </Link>
    </div>
  );
}
