import { supabaseServer } from "@/lib/supabaseServer";
import { createCraftShow, updateCraftShow, deleteCraftShow } from "./actions";

export const runtime = "nodejs";

type CraftShowRow = {
  id: string;
  name: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export default async function AdminCraftShowsPage() {
  const today = new Date().toISOString().slice(0, 10);
  
  const { data, error } = await supabaseServer
  .from("craft_shows")
  .select("id, name, location, start_date, end_date")
  .eq("is_active", true)
  .gte("start_date", today)
  .order("start_date", { ascending: true })
  .order("sort_order", { ascending: true });

  if (error) {
    return (
      <section className="space-y-8 text-background">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-background/60">Admin</p>
          <h2 className="mt-4 text-4xl font-semibold">Craft Shows</h2>
          <p className="mt-3 text-red-700">Failed to load craft shows: {error.message}</p>
        </div>
      </section>
    );
  }

  const shows = (data ?? []) as CraftShowRow[];

  return (
    <section className="space-y-8 text-background max-w-full">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-background/60">Admin</p>
        <h2 className="mt-4 text-4xl font-semibold">Craft Shows</h2>
        <p className="mt-3 text-background/70">
          Add and update upcoming craft shows shown on the landing page.
        </p>
      </div>

      <div className="rounded-2xl border border-background/15 bg-background/10 p-5">
        <h3 className="text-lg font-semibold">Add show</h3>

        <form action={createCraftShow} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-background/70">Name</span>
            <input
              name="name"
              required
              className="rounded-xl border border-background/15 bg-background/5 px-4 py-3"
              placeholder="Jefferson City Spring Market"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-background/70">Location</span>
            <input
              name="location"
              className="rounded-xl border border-background/15 bg-background/5 px-4 py-3"
              placeholder="Jefferson City, MO"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-background/70">Start date</span>
            <input
              name="start_date"
              required
              type="date"
              className="rounded-xl border border-background/15 bg-background/5 px-4 py-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-background/70">End date (optional)</span>
            <input
              name="end_date"
              type="date"
              className="rounded-xl border border-background/15 bg-background/5 px-4 py-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-background/70">Sort order</span>
            <input
              name="sort_order"
              type="number"
              defaultValue={0}
              className="rounded-xl border border-background/15 bg-background/5 px-4 py-3"
            />
          </label>

          <label className="flex items-center gap-3 pt-7">
            <input name="is_active" type="checkbox" defaultChecked />
            <span className="text-sm text-background/70">Active</span>
          </label>

          <div className="md:col-span-2">
            <button className="rounded-xl border border-background/15 bg-background px-5 py-3 font-semibold text-sandstone transition hover:opacity-90">
              Add show
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-4">
        {shows.length ? (
          shows.map((show) => (
            <article
              key={show.id}
              className="rounded-2xl border border-background/15 bg-background/10 p-5"
            >
              <form action={updateCraftShow} className="grid gap-4 md:grid-cols-2">
                <input type="hidden" name="id" value={show.id} />

                <label className="grid gap-2">
                  <span className="text-sm text-background/70">Name</span>
                  <input
                    name="name"
                    required
                    defaultValue={show.name}
                    className="rounded-xl border border-background/15 bg-background/5 px-4 py-3"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-background/70">Location</span>
                  <input
                    name="location"
                    defaultValue={show.location ?? ""}
                    className="rounded-xl border border-background/15 bg-background/5 px-4 py-3"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-background/70">Start date</span>
                  <input
                    name="start_date"
                    required
                    type="date"
                    defaultValue={show.start_date}
                    className="rounded-xl border border-background/15 bg-background/5 px-4 py-3"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-background/70">End date</span>
                  <input
                    name="end_date"
                    type="date"
                    defaultValue={show.end_date ?? ""}
                    className="rounded-xl border border-background/15 bg-background/5 px-4 py-3"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm text-background/70">Sort order</span>
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={show.sort_order ?? 0}
                    className="rounded-xl border border-background/15 bg-background/5 px-4 py-3"
                  />
                </label>

                <label className="flex items-center gap-3 pt-7">
                  <input name="is_active" type="checkbox" defaultChecked={show.is_active} />
                  <span className="text-sm text-background/70">Active</span>
                </label>

                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <button className="rounded-xl border border-background/15 bg-background px-5 py-3 font-semibold text-sandstone transition hover:opacity-90">
                    Save
                  </button>
                </div>
              </form>

              <form action={deleteCraftShow} className="mt-3">
                <input type="hidden" name="id" value={show.id} />
                <button className="rounded-xl border border-red-700/40 bg-red-700/10 px-5 py-3 font-semibold text-red-900 transition hover:opacity-90">
                  Delete
                </button>
              </form>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-background/15 bg-background/10 p-6 text-background/70">
            No craft shows yet.
          </div>
        )}
      </div>
    </section>
  );
}