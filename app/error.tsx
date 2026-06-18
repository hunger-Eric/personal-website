// app/error.tsx
"use client";

import { useEffect } from "react";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";
import { ActionButton } from "@/components/system";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto flex w-full max-w-md flex-col items-center text-center text-foreground">
        {/* Error icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ~/error
        </p>

        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          An unexpected error occurred. Please try again or return to the home
          page.
        </p>

        {/* Error digest for debugging (only in development or for support) */}
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ActionButton
            onClick={reset}
            tone="primary"
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Try again
          </ActionButton>

          <ActionButton
            href="/"
            tone="secondary"
            icon={<Home className="h-4 w-4" />}
          >
            Back to home
          </ActionButton>
        </div>
      </div>
    </main>
  );
}
