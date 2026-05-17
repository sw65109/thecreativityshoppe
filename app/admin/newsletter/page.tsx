import { supabaseServer } from "@/lib/supabaseServer";

export const runtime = "nodejs";

type NewsletterSignup = {
  email: string | null;
  source: string | null;
  created_at: string | null;
};

export default async function AdminNewsletterPage() {
  const { data, error } = await supabaseServer
    .from("newsletter_signups")
    .select("email, source, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <section className="space-y-8 text-background">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-background/60">
            Admin
          </p>
          <h2 className="mt-4 text-4xl font-semibold">Newsletter</h2>
          <p className="mt-3 text-red-700">
            Failed to load newsletter signups: {error.message}
          </p>
        </div>
      </section>
    );
  }

  const signups = (data ?? []) as NewsletterSignup[];

  return (
    <section className="space-y-8 text-background max-w-full">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-background/60">
          Admin
        </p>
        <h2 className="mt-4 text-4xl font-semibold">Newsletter</h2>
        <p className="mt-3 text-background/70">
          People who signed up for the newsletter (latest first).
        </p>
      </div>

      <div className="rounded-2xl border border-background/15 bg-background/10">
        <div className="overflow-x-auto">
          <table className="min-w-160 w-full text-sm">
            <thead className="text-left text-background/70">
              <tr>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Source</th>
                <th className="px-5 py-4 font-semibold">Signed up</th>
              </tr>
            </thead>
            <tbody>
              {signups.length ? (
                signups.map((signup) => (
                  <tr
                    key={`${signup.email ?? "unknown"}-${signup.created_at ?? ""}`}
                    className="border-t border-background/10"
                  >
                    <td className="px-5 py-4 text-background">
                      {signup.email ?? "(missing email)"}
                    </td>
                    <td className="px-5 py-4 text-background/70">
                      {signup.source ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-background/60">
                      {signup.created_at
                        ? new Date(signup.created_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-8 text-background/70" colSpan={3}>
                    No newsletter signups yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}