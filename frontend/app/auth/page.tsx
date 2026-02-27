"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";

type Mode = "login" | "register";

const roles = ["farmer", "trader", "researcher"] as const;

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>(roles[0]);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");

  function resetForm() {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setRole(roles[0]);
    setState("");
    setDistrict("");
    setError(null);
  }

  function toggleMode() {
    setMode((m) => (m === "login" ? "register" : "login"));
    resetForm();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem("token", res.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.register({
        name: fullName,
        email,
        password,
        phone: phone || undefined,
        location: [state, district].filter(Boolean).join(", ") || undefined,
      });
      localStorage.setItem("token", res.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* Shared input styles */
  const inputClass =
    "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";
  const labelClass = "block text-sm font-medium text-[var(--color-text)] mb-1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Sign in to your Annadata account"
              : "Register for a new Annadata account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
              {error}
            </div>
          )}

          {mode === "login" ? (
            /* ——— Login form ——— */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="login-password" className={labelClass}>
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={inputClass}
                />
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Sign In
              </Button>
            </form>
          ) : (
            /* ——— Registration form ——— */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="reg-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-password" className={labelClass}>
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-name" className={labelClass}>
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-role" className={labelClass}>
                  Role
                </label>
                <select
                  id="reg-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={inputClass}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-state" className={labelClass}>
                    State
                  </label>
                  <input
                    id="reg-state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="reg-district" className={labelClass}>
                    District
                  </label>
                  <input
                    id="reg-district"
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Pune"
                    className={inputClass}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Create Account
              </Button>
            </form>
          )}

          {/* Toggle link */}
          <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-[var(--color-primary)] hover:underline"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-[var(--color-primary)] hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
