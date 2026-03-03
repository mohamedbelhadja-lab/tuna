import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── Submissions ───────────────────────────────────────────────────────────────

export async function hasSubmittedToday(userId: string, theme: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("submissions")
    .select("id")
    .eq("user_id", userId)
    .eq("theme", theme)
    .gte("created_at", today.toISOString())
    .maybeSingle();

  return !!data;
}
```

Make sure your `.env.local` has all three variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
