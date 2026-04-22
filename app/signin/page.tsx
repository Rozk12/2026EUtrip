"use client";

import { useState } from "react";

export default function SignIn() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        setError("ID または PW が違います");
      }
    } catch {
      setError("ネットワークエラー");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-[100dvh] items-center justify-center bg-[#0b1828] px-4 text-[#ecd9b0]"
      style={{
        paddingTop: "calc(2.5rem + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-[rgba(212,168,75,0.35)] bg-[#132438] p-6 shadow-2xl"
      >
        <div className="text-center">
          <div className="font-title text-[10px] tracking-[0.4em] text-[#d4a84b]">
            DEN STORE REJSE · MMXXVI
          </div>
          <h1 className="mt-2 font-deco text-2xl text-[#e8c572]">Log ind</h1>
        </div>

        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.25em] text-[#cfb985]">
            Bruger
          </span>
          <input
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="text"
            enterKeyHint="next"
            autoFocus
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
            className="w-full rounded border border-[rgba(212,168,75,0.4)] bg-[#0b1828] px-3 py-3 text-base text-[#ecd9b0] focus:border-[#e8c572] focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.25em] text-[#cfb985]">
            Kode
          </span>
          <input
            type="password"
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            enterKeyHint="go"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
            className="w-full rounded border border-[rgba(212,168,75,0.4)] bg-[#0b1828] px-3 py-3 text-base text-[#ecd9b0] focus:border-[#e8c572] focus:outline-none"
          />
        </label>

        {error && (
          <div className="rounded border border-[#7a1d1d] bg-[rgba(140,36,48,0.2)] px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !user || !pass}
          className="w-full rounded-full bg-[#e8c572] px-4 py-3 font-title text-xs tracking-[0.4em] text-[#0b1828] shadow disabled:opacity-50"
        >
          {loading ? "..." : "Log ind"}
        </button>
      </form>
    </main>
  );
}
