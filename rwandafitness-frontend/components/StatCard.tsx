export default function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-zinc-900">
        {value}
      </p>
    </div>
  );
}