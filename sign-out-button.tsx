"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      style={{
        background: "transparent",
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: "8px 14px",
        fontSize: 13,
        cursor: "pointer",
        color: "#555",
      }}
    >
      Sign out
    </button>
  );
}
