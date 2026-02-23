"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

    useEffect(() => {
      redirect('/')
    }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill up all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/", // optional
      });

      if (res?.error) {
        toast.error(res.error.message ?? "Invalid credentials.");
        return;
      }

      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error("Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-background p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your credentials.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              type="email"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Password</label>
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
            type="submit"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-muted-foreground mt-4">
          No account yet?{" "}
          <Link className="text-black underline" href="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
