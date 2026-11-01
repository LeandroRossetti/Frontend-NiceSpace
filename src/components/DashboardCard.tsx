interface DashboardCardProps {
  name: string
  location: string
  price: number
  currency?: string
  capacity?: number
  tags?: string[]
  premium?: boolean
  available?: boolean
}

export default function DashboardCard({
  name,
  location,
  price,
  currency = 'USD',
  capacity = 4,
  tags = ['Wi-Fi', 'Cafetería'],
  premium = false,
  available = true,
}: DashboardCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <div className="relative h-32 border-t-4 border-primary-500 bg-gradient-to-br from-primary-500 to-primary-800 dark:bg-none dark:bg-surface">
        {premium && (
          <span className="absolute left-4 top-4 rounded-lg bg-accent-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-950 shadow-sm">
            Premium
          </span>
        )}
        <span
          className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
            available
              ? 'bg-white/90 text-success-700'
              : 'bg-white/90 text-danger-700'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              available ? 'bg-success-500' : 'bg-danger-500'
            }`}
          />
          {available ? 'Disponible' : 'Ocupado'}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {location}
            </p>
          </div>
          <p className="shrink-0 text-right">
            <span className="text-2xl font-extrabold text-primary-700 dark:text-primary-300">
              ${price}
            </span>
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              {currency} / día
            </span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {capacity} puestos
          </span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <button className="mt-5 w-full rounded-lg bg-secondary-700 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-secondary-800 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background">
          Reservar espacio
        </button>
      </div>
    </article>
  )
}
