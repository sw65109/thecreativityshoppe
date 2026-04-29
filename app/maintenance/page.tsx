export default function MaintenancePage() {
    return (
      <main className="min-h-screen bg-sandstone text-background">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-background/60">
            Maintenance
          </p>
          <h1 className="mt-4 text-4xl font-semibold">We’ll be right back</h1>
          <p className="mt-4 text-background/70">
            We’re upgrading our website. Please check back soon.
          </p>
        </div>
      </main>
    );
  }