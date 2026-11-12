# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Cómo ejecutarlo localmente

1. Instalar dependencias (usa `bun`, o `npm i` si prefieres npm):

```sh
bun install
bun run dev
```

2. Variables de entorno (archivo `.env`, ya incluido):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`: conexión a la base de datos del proyecto.
   - `LOVABLE_API_KEY`: necesaria solo para el "Resumen clínico" generado con IA (función de servidor `src/lib/clinical-summary.functions.ts`). Sin esta variable, la app funciona igual, pero el botón "Generar resumen" devolverá un error.

3. Base de datos: las tablas `public.patients` y `public.activity_logs` se crean con la migración incluida en `drizzle/migrations/0000_create_patients_and_activity_logs.sql`.

4. PWA: el manifest está en `public/manifest.webmanifest` con sus íconos en `public/icons/`.
