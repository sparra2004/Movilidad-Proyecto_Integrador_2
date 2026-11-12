CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  age integer NOT NULL DEFAULT 70,
  diagnosis text NOT NULL DEFAULT '',
  room text NOT NULL DEFAULT '',
  days_per_week integer NOT NULL DEFAULT 5,
  sessions_per_day integer NOT NULL DEFAULT 1,
  intensity text NOT NULL DEFAULT 'moderada',
  minutes integer NOT NULL DEFAULT 10,
  exercise_type text NOT NULL DEFAULT 'movilidad',
  schedule_time text NOT NULL DEFAULT '09:00',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  done boolean NOT NULL DEFAULT false,
  borg text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id, log_date)
);

CREATE INDEX activity_logs_patient_idx ON public.activity_logs (patient_id, log_date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO anon, authenticated;
GRANT ALL ON public.patients TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_logs TO anon, authenticated;
GRANT ALL ON public.activity_logs TO service_role;

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso abierto a pacientes" ON public.patients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acceso abierto a registros" ON public.activity_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.patients (id, patient_name, age, diagnosis, room, days_per_week, sessions_per_day, intensity, minutes, exercise_type, schedule_time) VALUES
 ('11111111-1111-4111-8111-111111111111', 'Rosa Elena Gómez', 74, 'Postoperatorio de cadera', 'Hab. 412 · Piso 4', 5, 2, 'moderada', 10, 'movilidad', '09:00'),
 ('22222222-2222-4222-8222-222222222222', 'Jorge Alberto Ruiz', 81, 'Neumonía adquirida en comunidad', 'Hab. 407 · Piso 4', 4, 1, 'suave', 8, 'resistencia', '10:30'),
 ('33333333-3333-4333-8333-333333333333', 'Marta Lucía Peña', 68, 'Insuficiencia cardiaca compensada', 'Hab. 418 · Piso 4', 6, 2, 'moderada', 12, 'fuerza', '08:00');

INSERT INTO public.activity_logs (patient_id, log_date, done, borg, reason) VALUES
 ('11111111-1111-4111-8111-111111111111', current_date - 6, true, 'normal', NULL),
 ('11111111-1111-4111-8111-111111111111', current_date - 5, true, 'facil', NULL),
 ('11111111-1111-4111-8111-111111111111', current_date - 4, false, NULL, 'procedimiento'),
 ('11111111-1111-4111-8111-111111111111', current_date - 3, true, 'cansado', NULL),
 ('11111111-1111-4111-8111-111111111111', current_date - 2, true, 'normal', NULL),
 ('11111111-1111-4111-8111-111111111111', current_date - 1, true, 'facil', NULL),
 ('22222222-2222-4222-8222-222222222222', current_date - 6, false, NULL, 'cansancio'),
 ('22222222-2222-4222-8222-222222222222', current_date - 5, true, 'agotado', NULL),
 ('22222222-2222-4222-8222-222222222222', current_date - 4, false, NULL, 'dolor'),
 ('22222222-2222-4222-8222-222222222222', current_date - 3, true, 'cansado', NULL),
 ('22222222-2222-4222-8222-222222222222', current_date - 2, false, NULL, 'cansancio'),
 ('22222222-2222-4222-8222-222222222222', current_date - 1, true, 'cansado', NULL),
 ('33333333-3333-4333-8333-333333333333', current_date - 6, true, 'facil', NULL),
 ('33333333-3333-4333-8333-333333333333', current_date - 5, true, 'normal', NULL),
 ('33333333-3333-4333-8333-333333333333', current_date - 4, true, 'facil', NULL),
 ('33333333-3333-4333-8333-333333333333', current_date - 3, true, 'normal', NULL),
 ('33333333-3333-4333-8333-333333333333', current_date - 2, false, NULL, 'singanas'),
 ('33333333-3333-4333-8333-333333333333', current_date - 1, true, 'facil', NULL);
