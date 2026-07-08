import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS on the "files" table only returns rows belonging to this user's client_id,
  // so this query is automatically scoped -- no manual filtering needed here.
  const { data: files, error } = await supabase
    .from("files")
    .select("id, name, description, storage_path, created_at")
    .order("created_at", { ascending: false });

  let signedFiles: { id: string; name: string; description: string | null; url: string | null; created_at: string }[] = [];

  if (files) {
    signedFiles = await Promise.all(
      files.map(async (f) => {
        const { data } = await supabase.storage
          .from("client-files")
          .createSignedUrl(f.storage_path, 60 * 10); // 10 minute download link
        return {
          id: f.id,
          name: f.name,
          description: f.description,
          created_at: f.created_at,
          url: data?.signedUrl ?? null,
        };
      })
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, color: "#1F3864", margin: 0 }}>
            Your Reports
          </h1>
          <p style={{ color: "#666", fontSize: 14, margin: "4px 0 0" }}>
            Signed in as {user?.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      {error && (
        <p style={{ color: "#B3261E" }}>Couldn't load files: {error.message}</p>
      )}

      {signedFiles.length === 0 && !error && (
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 32,
            textAlign: "center",
            color: "#888",
          }}
        >
          No reports have been shared with you yet.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {signedFiles.map((f) => (
          <a
            key={f.id}
            href={f.url ?? "#"}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "white",
              borderRadius: 10,
              padding: "16px 20px",
              textDecoration: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: "#1F3864" }}>{f.name}</div>
              {f.description && (
                <div style={{ fontSize: 13, color: "#777", marginTop: 2 }}>
                  {f.description}
                </div>
              )}
            </div>
            <span style={{ fontSize: 13, color: "#1F3864", fontWeight: 600 }}>
              Download →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
