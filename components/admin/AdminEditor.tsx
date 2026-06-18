"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Save, ArrowLeft } from "lucide-react";
import { ActionButton, StatusNote } from "@/components/system";
import { adminCopy } from "@/config/copy/admin";

type AdminData = Record<string, unknown>;

type Props<TData extends AdminData = AdminData> = {
  title: string;
  description: string;
  configKey: string;
  loadUrl?: string;
  children: (data: TData, setData: (data: TData) => void) => ReactNode;
  transformSave?: (data: TData) => unknown;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function AdminEditor<TData extends AdminData = AdminData>({
  title,
  description,
  configKey,
  loadUrl,
  children,
  transformSave,
}: Props<TData>) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ciMessage, setCiMessage] = useState<string | null>(null);
  const copy = adminCopy.editor;

  useEffect(() => {
    const url = loadUrl || `/api/admin/${configKey}`;
    fetch(url)
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as {
          config?: TData;
          error?: string;
        } & TData;

        if (!response.ok) {
          const msg =
            body?.error || `${copy.requestFailed} (${response.status})`;
          throw new Error(msg);
        }

        const nextData = (body?.config ?? body) as TData;
        if (!nextData || typeof nextData !== "object") {
          throw new Error(copy.invalidPayload);
        }

        setData(nextData);
      })
      .catch((loadError: unknown) =>
        setError(`${copy.loadFailed}: ${getErrorMessage(loadError)}`)
      )
      .finally(() => setLoading(false));
  }, [configKey, loadUrl, copy.invalidPayload, copy.loadFailed, copy.requestFailed]);

  const handleSave = useCallback(async () => {
    if (!data) return;

    setSaving(true);
    setMessage(null);
    setError(null);
    setCiMessage(null);

    try {
      const payload = transformSave ? transformSave(data) : data;
      const response = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: configKey,
          content: payload,
          message: `feat: update ${configKey} via admin`,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || copy.saveFailed);
      }

      const result = (await response.json()) as {
        message?: string;
        deployId?: string;
      };
      setMessage(result.message || adminCopy.common.saveToGitHub);

      const ciPollInterval = setInterval(async () => {
        try {
          const ciResponse = await fetch("/api/admin/ci-status");
          if (!ciResponse.ok) return;
          const ciData = (await ciResponse.json()) as {
            status?: string;
            conclusion?: string;
            runNumber?: string | number;
          };
          const runNumber = ciData.runNumber ?? "?";

          if (ciData.status === "NOT_FOUND") {
            setCiMessage(copy.ci.notFound);
            return;
          }

          if (ciData.status === "queued" || ciData.status === "waiting") {
            setCiMessage(`CI #${runNumber}: ${copy.ci.queued}`);
            return;
          }

          if (ciData.status === "in_progress") {
            setCiMessage(`CI #${runNumber}: ${copy.ci.running}`);
            return;
          }

          if (ciData.status === "completed") {
            if (ciData.conclusion === "success") {
              setCiMessage(`CI #${runNumber}: ${copy.ci.passed}`);
            } else {
              setCiMessage(
                `CI #${runNumber}: ${ciData.conclusion || copy.ci.failed}`
              );
            }
            clearInterval(ciPollInterval);
          }
        } catch {
          // Keep the save flow unaffected by status polling.
        }
      }, 8000);

      setTimeout(() => clearInterval(ciPollInterval), 300000);

      if (result.deployId) {
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(
              `/api/admin/deploy-status?deployId=${result.deployId}`
            );
            if (!statusResponse.ok) return;
            const statusData = (await statusResponse.json()) as {
              status?: string;
            };

            if (statusData.status === "READY") {
              setMessage(`${configKey} ${copy.savedAndDeployed}`);
              clearInterval(pollInterval);
            } else if (
              statusData.status === "ERROR" ||
              statusData.status === "FAILED"
            ) {
              setMessage(`${configKey} ${copy.savedDeployFailed}`);
              clearInterval(pollInterval);
            } else {
              setMessage(`${configKey} ${copy.deploying}`);
            }
          } catch {
            // Ignore polling errors.
          }
        }, 5000);

        setTimeout(() => clearInterval(pollInterval), 180000);
      }
    } catch (saveError: unknown) {
      setError(`${copy.saveFailed}: ${getErrorMessage(saveError)}`);
    } finally {
      setSaving(false);
    }
  }, [data, configKey, transformSave, copy]);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 z-30 -mx-6 mb-8 flex items-center justify-between border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
        <div>
          <ActionButton
            href="/admin"
            tone="ghost"
            icon={<ArrowLeft className="h-3 w-3" />}
            className="mb-1 px-0 py-1 text-xs"
          >
            {copy.backToDashboard}
          </ActionButton>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <ActionButton
          type="button"
          onClick={handleSave}
          disabled={saving || !data}
          tone="primary"
          icon={
            saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )
          }
        >
          {saving ? adminCopy.common.saving : adminCopy.common.saveToGitHub}
        </ActionButton>
      </header>

      <div className="mx-auto max-w-4xl">
        {description ? (
          <p className="mb-6 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}

        <div className="mb-6 space-y-3">
          {message ? <StatusNote tone="success">{message}</StatusNote> : null}
          {ciMessage ? <StatusNote tone="info">{ciMessage}</StatusNote> : null}
          {error ? <StatusNote tone="danger">{error}</StatusNote> : null}
        </div>

        {data ? children(data, setData) : null}
      </div>
    </div>
  );
}
