import DashboardCard from '../components/DashboardCard'
import ThemeToggle from '../components/ThemeToggle'

export default function DemoPreview() {
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
              OpenSpot · Validación de identidad
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-foreground">
              Dashboard Card
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Revisá el contraste entre cian, naranja, amarillo y las sombras
              suaves. Alterná el tema con el botón.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            name="Sala Norte"
            location="Palermo, Buenos Aires"
            price={45}
            capacity={6}
            tags={['Wi-Fi', 'Proyector']}
            premium
          />
          <DashboardCard
            name="Escritorio 14"
            location="Microcentro, CABA"
            price={18}
            capacity={1}
            tags={['Wi-Fi', 'Café']}
          />
          <DashboardCard
            name="Box Reuniones"
            location="Belgrano, CABA"
            price={60}
            capacity={8}
            tags={['Wi-Fi', 'TV 4K', 'Aire']}
            premium
            available={false}
          />
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Nota de revisión
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Botones e inputs usan <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">rounded-lg</code>,
            mientras que tarjetas y paneles usan <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">rounded-2xl</code>.
            La CTA naranja se apoya en <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">secondary-700</code> para
            cumplir contraste AA con texto blanco; el cian actúa como estructura y el amarillo solo como acento.
          </p>
        </div>
      </div>
    </div>
  )
}
