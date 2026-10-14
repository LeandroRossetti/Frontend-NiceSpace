export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      {label && <p className="mt-3 text-sm text-gray-500">{label}</p>}
    </div>
  )
}
