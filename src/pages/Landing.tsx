import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const valores = [
  {
    titulo: 'Simplicidad',
    descripcion:
      'Una interfaz limpia y directa para que reserves o publiques espacios en segundos, sin fricción.',
  },
  {
    titulo: 'Flexibilidad',
    descripcion:
      'Salas, escritorios, boxes y áreas comunes. Vos definís la distribución de tu edificio piso por piso.',
  },
  {
    titulo: 'Colaboración',
    descripcion:
      'Creá equipos, compartí reservas y coordiná el día a día de tu coworking desde un solo lugar.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/icon.jpeg"
              alt="OpenSpot"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="text-lg font-bold text-primary-800">OpenSpot</span>
          </Link>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:bg-surface-muted"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 text-center">
        <img
          src="/icon.jpeg"
          alt="OpenSpot"
          className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-soft"
        />
        <span className="mt-8 inline-block rounded-lg bg-accent-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-950">
          Gestión de coworking
        </span>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Gestioná tu coworking de forma ágil y sin fricción
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Publicá espacios, administrá reservas y equipos, y controlá tu
          edificio con mapas interactivos. Todo en un solo lugar.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-secondary-600 px-7 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary-700 hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
          >
            Empezar ahora
          </Link>
          <a
            href="#quienes-somos"
            className="rounded-lg border border-border px-7 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-surface-muted"
          >
            Conocer más
          </a>
        </div>
      </section>

      {/* Quiénes somos */}
      <section id="quienes-somos" className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
              Quiénes somos
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Una plataforma pensada para que el coworking fluya
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              OpenSpot nace para simplificar la operación diaria de los
              espacios de trabajo compartidos. Unimos a quienes ofrecen sus
              espacios con quienes necesitan un lugar flexible para trabajar,
              con herramientas claras para ambos lados.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                Mapa interactivo de pisos y puestos
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary-600" />
                Reservas y equipos en tiempo real
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                Control total para dueños y administradores
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-surface-muted p-6 text-center">
                <p className="text-3xl font-extrabold text-primary-700">100%</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Gestión centralizada
                </p>
              </div>
              <div className="rounded-2xl bg-surface-muted p-6 text-center">
                <p className="text-3xl font-extrabold text-secondary-700">
                  Piso a piso
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Control de tu edificio
                </p>
              </div>
              <div className="rounded-2xl bg-surface-muted p-6 text-center">
                <p className="text-3xl font-extrabold text-accent-600">
                  Equipos
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reservas compartidas
                </p>
              </div>
              <div className="rounded-2xl bg-surface-muted p-6 text-center">
                <p className="text-3xl font-extrabold text-primary-700">
                  24/7
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Disponibilidad real
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misión */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
              Nuestra misión
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Hacer del coworking una experiencia sin fricción
            </h2>
            <p className="mt-4 text-muted-foreground">
              Creemos en el trabajo flexible. Por eso construimos herramientas
              que se adaptan a cada espacio, sin procesos rígidos.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {valores.map((v) => (
              <div
                key={v.titulo}
                className="rounded-2xl border border-border bg-background p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
              >
                <div className="h-2 w-10 rounded-full bg-secondary-600" />
                <h3 className="mt-4 text-lg font-bold">{v.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {v.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft sm:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                  Contacto
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  ¿Tenés dudas o querés sumar tu espacio?
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Escribinos y te ayudamos a empezar con OpenSpot.
                </p>
              </div>
              <div className="space-y-3">
                <a
                  href="mailto:hola@openspot.app"
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-surface-muted"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  hola@openspot.app
                </a>
                <a
                  href="#quienes-somos"
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-surface-muted"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-50 text-secondary-700 dark:bg-secondary-500/10 dark:text-secondary-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20.5s6-5.33 6-10.5a6 6 0 1 0-12 0c0 5.17 6 10.5 6 10.5z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </span>
                  Buenos Aires, Argentina
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <img
              src="/icon.jpeg"
              alt="OpenSpot"
              className="h-6 w-6 rounded-md object-cover"
            />
            <span className="font-semibold text-foreground">OpenSpot</span>
          </div>
          <p>© {new Date().getFullYear()} OpenSpot. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
