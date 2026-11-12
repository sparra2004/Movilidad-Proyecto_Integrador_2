import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LogSchema = z.object({
  date: z.string(),
  done: z.boolean(),
  borg: z.string().optional(),
  reason: z.string().optional(),
});

const SummaryInput = z.object({
  patientName: z.string().min(1),
  age: z.number(),
  room: z.string(),
  diagnosis: z.string(),
  plan: z.object({
    daysPerWeek: z.number(),
    sessionsPerDay: z.number(),
    minutes: z.number(),
    intensity: z.string(),
    type: z.string(),
  }),
  logs: z.array(LogSchema).max(60),
});

export type ClinicalSummaryInput = z.infer<typeof SummaryInput>;

export const generateClinicalSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SummaryInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Falta la configuración de IA (LOVABLE_API_KEY).");

    const prompt = [
      "Eres fisioterapeuta clínico. Redacta en español un resumen clínico breve para el personal de salud",
      "sobre la actividad física de un paciente hospitalizado mayor de 60 años.",
      "Usa exactamente estas secciones con encabezados en mayúscula sostenida y frases cortas:",
      "ADHERENCIA, ESFUERZO PERCIBIDO, MOTIVOS DE INCUMPLIMIENTO, RECOMENDACIÓN.",
      "Máximo 160 palabras en total. No inventes datos clínicos que no estén aquí.",
      "",
      `Paciente: ${data.patientName}, ${data.age} años, ${data.room}. Diagnóstico: ${data.diagnosis}.`,
      `Prescripción FITT: ${data.plan.daysPerWeek} días/semana, ${data.plan.sessionsPerDay} sesiones/día, ${data.plan.minutes} min, intensidad ${data.plan.intensity}, tipo ${data.plan.type}.`,
      "Registros diarios (esfuerzo percibido tipo Borg simplificado o motivo de no realización):",
      ...data.logs.map(
        (l) =>
          `- ${l.date}: ${l.done ? `realizado, esfuerzo ${l.borg ?? "no registrado"}` : `no realizado, motivo ${l.reason ?? "no registrado"}`}`,
      ),
    ].join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => "");
      if (response.status === 429)
        throw new Error("El servicio de IA está ocupado. Intente de nuevo en unos segundos.");
      if (response.status === 402)
        throw new Error("Se agotaron los créditos de IA del espacio de trabajo.");
      throw new Error(`No se pudo generar el resumen (${response.status}). ${detail.slice(0, 200)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as { type?: string; delta?: string };
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            text += event.delta;
          }
        } catch {
          /* fragmento no JSON */
        }
      }
    }

    return { summary: text.trim(), generatedAt: new Date().toISOString() };
  });
