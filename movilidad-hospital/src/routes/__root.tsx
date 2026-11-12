import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-base text-muted-foreground">
          La página que busca no existe o fue movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="tap-target inline-flex items-center justify-center bg-primary px-6 py-3 text-primary-foreground"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página no se pudo cargar
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Ocurrió un problema. Puede intentar de nuevo o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="tap-target inline-flex items-center justify-center bg-primary px-6 py-3 text-primary-foreground"
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="tap-target inline-flex items-center justify-center border border-input bg-card px-6 py-3 text-foreground"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1d6fa5" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Movilidad" },
      { title: "Movilidad Hospitalaria" },
      {
        name: "description",
        content:
          "Plan de actividad física guiado para pacientes hospitalizados mayores de 60 años.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Nunito+Sans:wght@400;600;700;800&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ViewSwitcher() {
  const base =
    "flex-1 rounded-xl px-4 py-3 text-center text-base font-bold transition-colors sm:text-lg";
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src="/icons/icon-192.png" alt="" width={44} height={44} className="rounded-xl" />
          <div>
            <p className="font-display text-lg font-bold leading-tight">Movilidad Hospitalaria</p>
            <p className="text-sm text-muted-foreground">Sistema Clínico · Piso 4</p>
          </div>
        </div>
        <nav aria-label="Cambiar de vista" className="flex flex-wrap gap-1.5 rounded-2xl bg-muted p-1.5">
          <Link
            to="/"
            className={`${base} text-muted-foreground hover:text-foreground`}
            activeProps={{ className: `${base} bg-primary text-primary-foreground` }}
            activeOptions={{ exact: true }}
          >
            Vista Paciente
          </Link>
          <Link
            to="/pacientes"
            className={`${base} text-muted-foreground hover:text-foreground`}
            activeProps={{ className: `${base} bg-primary text-primary-foreground` }}
          >
            Pacientes
          </Link>
          <Link
            to="/personal-medico"
            className={`${base} text-muted-foreground hover:text-foreground`}
            activeProps={{ className: `${base} bg-primary text-primary-foreground` }}
          >
            Personal de Salud
          </Link>
          <Link
            to="/plan-individual"
            className={`${base} text-muted-foreground hover:text-foreground`}
            activeProps={{ className: `${base} bg-primary text-primary-foreground` }}
          >
            Plan Individual ⭐
          </Link>
          <Link
            to="/guia"
            className={`${base} text-muted-foreground hover:text-foreground`}
            activeProps={{ className: `${base} bg-primary text-primary-foreground` }}
          >
            Guía
          </Link>
        </nav>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <ViewSwitcher />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
