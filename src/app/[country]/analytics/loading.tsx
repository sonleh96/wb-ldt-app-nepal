export default function AnalyticsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pb-16 pt-10 sm:px-8 lg:px-12">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-40 rounded-full bg-white/70" />
        <div className="h-16 w-full max-w-3xl rounded-[1.5rem] bg-white/70" />
        <div className="h-24 rounded-[1.5rem] bg-white/70" />
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="h-[420px] rounded-[2rem] bg-white/70" />
          <div className="h-[420px] rounded-[2rem] bg-white/70" />
        </div>
      </div>
    </main>
  );
}
