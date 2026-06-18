"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, LogIn } from "lucide-react";

import {
  ActionButton,
  AdminPanel,
  FormField,
  PageShell,
  StatusNote,
} from "@/components/system";
import { adminCopy } from "@/config/copy/admin";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error || adminCopy.login.errors.loginFailed);
        return;
      }

      router.push(redirectTo);
    } catch {
      setError(adminCopy.login.errors.network);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <header className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-control border border-border bg-surface-admin text-muted-foreground">
          <Lock className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {adminCopy.login.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {adminCopy.login.description}
        </p>
      </header>

      <AdminPanel title={adminCopy.login.panelTitle}>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FormField label={adminCopy.login.passwordLabel}>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={adminCopy.login.passwordPlaceholder}
              autoFocus
              disabled={loading}
              className="w-full rounded-control border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent disabled:opacity-50"
            />
          </FormField>

          {error ? <StatusNote tone="danger">{error}</StatusNote> : null}

          <ActionButton
            type="submit"
            tone="primary"
            disabled={loading || !password}
            icon={
              loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
              ) : (
                <LogIn className="h-4 w-4" aria-hidden="true" />
              )
            }
            className="w-full"
          >
            {loading ? adminCopy.login.verifying : adminCopy.login.submit}
          </ActionButton>
        </form>
      </AdminPanel>

      <p className="text-center text-xs leading-5 text-muted-foreground">
        {adminCopy.login.tokenHint}
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <PageShell tone="admin" className="flex min-h-screen items-center justify-center p-4">
      <main className="w-full max-w-sm">
        <Suspense
          fallback={
            <StatusNote className="text-center">
              {adminCopy.login.loading}
            </StatusNote>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </PageShell>
  );
}
