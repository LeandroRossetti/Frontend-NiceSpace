export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
      {label && <p className="mt-3 text-sm text-muted-foreground">{label}</p>}
    </div>
  )
}
