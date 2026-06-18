// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminEditor } from "@/components/admin/AdminEditor";
import { adminCopy } from "@/config/copy/admin";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/admin",
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: ReactNode;
    href: string;
  }) => React.createElement("a", { href, "data-testid": "next-link" }, children),
}));

vi.mock("lucide-react", () => ({
  Save: () =>
    React.createElement("svg", {
      "aria-hidden": "true",
      "data-testid": "save-icon",
    }),
  ArrowLeft: () =>
    React.createElement("svg", {
      "aria-hidden": "true",
      "data-testid": "arrow-left",
    }),
}));

type TestData = {
  test?: boolean;
  transformed?: boolean;
};

type EditorTestProps = {
  title?: string;
  description?: string;
  configKey?: string;
  loadUrl?: string;
  transformSave?: (data: TestData) => unknown;
  children?: (
    data: TestData,
    setData: (data: TestData) => void,
  ) => ReactNode;
};

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

const common = adminCopy.common;
const editor = adminCopy.editor;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function defaultLoadResponse() {
  return jsonResponse({ config: { test: true } });
}

function setFetchMock(
  handler: (input: FetchInput, init?: FetchInit) => Response | Promise<Response>,
) {
  const fetchMock = vi.fn((input: FetchInput, init?: FetchInit) =>
    Promise.resolve(handler(input, init)),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function renderEditor(props: EditorTestProps = {}) {
  const {
    title = "X",
    description = "D",
    configKey = "site",
    children = (data: TestData) =>
      React.createElement("div", { "data-testid": "content" }, JSON.stringify(data)),
    ...rest
  } = props;

  render(
    <AdminEditor<TestData>
      title={title}
      description={description}
      configKey={configKey}
      {...rest}
    >
      {children}
    </AdminEditor>,
  );

  return screen.findByRole("button", { name: common.saveToGitHub });
}

async function clickSave() {
  fireEvent.click(
    await screen.findByRole("button", { name: common.saveToGitHub }),
  );
}

type IntervalCallback = () => void | Promise<void>;

function captureIntervals() {
  const callbacks: IntervalCallback[] = [];
  const intervalMock = vi.fn((handler: TimerHandler) => {
    callbacks.push(
      typeof handler === "function"
        ? (handler as IntervalCallback)
        : () => undefined,
    );
    return callbacks.length as ReturnType<typeof setInterval>;
  });
  vi.stubGlobal("setInterval", intervalMock);
  vi.stubGlobal("clearInterval", vi.fn());
  return callbacks;
}

async function runIntervals(callbacks: IntervalCallback[]) {
  await act(async () => {
    for (const callback of callbacks) {
      await callback();
    }
  });
}

describe("AdminEditor load", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders title, description, back action, save action, and content after load", async () => {
    setFetchMock(() => defaultLoadResponse());

    await renderEditor({ title: "My Editor", description: "Desc" });

    expect(
      screen.getByRole("heading", { level: 1, name: "My Editor" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: editor.backToDashboard }),
    ).toHaveAttribute("href", "/admin");
    expect(screen.getByTestId("content")).toHaveTextContent('"test":true');
  });

  it("shows a localized error on load failure", async () => {
    setFetchMock(() => Promise.reject(new Error("Network error")));

    render(
      <AdminEditor<TestData> title="X" description="D" configKey="site">
        {() => React.createElement("div", null, "Content")}
      </AdminEditor>,
    );

    await waitFor(() =>
      expect(
        screen.getByText(`${editor.loadFailed}: Network error`),
      ).toBeInTheDocument(),
    );
  });

  it("shows a localized request error for non-ok load responses without body.error", async () => {
    setFetchMock(() => new Response("Not Found", { status: 404 }));

    render(
      <AdminEditor<TestData> title="X" description="D" configKey="site">
        {() => React.createElement("div", null, "Content")}
      </AdminEditor>,
    );

    await waitFor(() =>
      expect(
        screen.getByText(`${editor.loadFailed}: ${editor.requestFailed} (404)`),
      ).toBeInTheDocument(),
    );
  });

  it("shows a localized invalid-payload error when config is not an object", async () => {
    setFetchMock(() => jsonResponse({ config: "string" }));

    render(
      <AdminEditor<TestData> title="X" description="D" configKey="site">
        {() => React.createElement("div", null, "Content")}
      </AdminEditor>,
    );

    await waitFor(() =>
      expect(
        screen.getByText(`${editor.loadFailed}: ${editor.invalidPayload}`),
      ).toBeInTheDocument(),
    );
  });

  it("uses custom loadUrl when provided", async () => {
    let capturedUrl = "";
    setFetchMock((input) => {
      capturedUrl = String(input);
      return defaultLoadResponse();
    });

    await renderEditor({ loadUrl: "/api/custom" });

    expect(capturedUrl).toBe("/api/custom");
  });
});

describe("AdminEditor save", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows the save success message returned by the API", async () => {
    setFetchMock((input) => {
      if (String(input) === "/api/admin/save") {
        return jsonResponse({ message: "Saved OK" });
      }
      return defaultLoadResponse();
    });

    await renderEditor();
    await clickSave();

    expect(await screen.findByText("Saved OK")).toBeInTheDocument();
  });

  it("shows a localized save error when the API rejects the payload", async () => {
    setFetchMock((input) => {
      if (String(input) === "/api/admin/save") {
        return jsonResponse({ error: "Bad data" }, 400);
      }
      return defaultLoadResponse();
    });

    await renderEditor();
    await clickSave();

    expect(
      await screen.findByText(`${editor.saveFailed}: Bad data`),
    ).toBeInTheDocument();
  });

  it("shows the localized saving state while the save request is pending", async () => {
    setFetchMock((input) => {
      if (String(input) === "/api/admin/save") {
        return new Promise<Response>(() => undefined);
      }
      return defaultLoadResponse();
    });

    await renderEditor();
    await clickSave();

    expect(
      await screen.findByRole("button", { name: common.saving }),
    ).toBeDisabled();
  });

  it("applies transformSave before sending the save payload", async () => {
    let sentBody: {
      key?: string;
      content?: TestData;
      message?: string;
    } | null = null;

    setFetchMock((input, init) => {
      if (String(input) === "/api/admin/save") {
        sentBody = JSON.parse(String(init?.body)) as typeof sentBody;
        return jsonResponse({ message: "Saved" });
      }
      return defaultLoadResponse();
    });

    await renderEditor({
      transformSave: (data) => ({ ...data, transformed: true }),
    });
    await clickSave();

    expect(await screen.findByText("Saved")).toBeInTheDocument();
    expect(sentBody).toMatchObject({
      key: "site",
      content: { test: true, transformed: true },
      message: "feat: update site via admin",
    });
  });
});

describe("AdminEditor CI polling", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function renderSavedEditorWithCi(
    ciBody: unknown,
    ciStatus = 200,
    saveBody: unknown = { message: "Saved" },
  ) {
    setFetchMock((input) => {
      const url = String(input);
      if (url === "/api/admin/save") return jsonResponse(saveBody);
      if (url === "/api/admin/ci-status") return jsonResponse(ciBody, ciStatus);
      return defaultLoadResponse();
    });

    await renderEditor();
    const intervals = captureIntervals();
    fireEvent.click(screen.getByRole("button", { name: common.saveToGitHub }));
    expect(await screen.findByText("Saved")).toBeInTheDocument();
    await waitFor(() => expect(intervals.length).toBeGreaterThan(0));
    return intervals;
  }

  it("shows passed when CI completes successfully", async () => {
    const intervals = await renderSavedEditorWithCi({
      status: "completed",
      conclusion: "success",
      runNumber: 42,
    });

    await runIntervals(intervals);

    expect(
      await screen.findByText(`CI #42: ${editor.ci.passed}`),
    ).toBeInTheDocument();
  });

  it("shows the raw conclusion when CI completes with a failure conclusion", async () => {
    const intervals = await renderSavedEditorWithCi({
      status: "completed",
      conclusion: "failure",
      runNumber: 7,
    });

    await runIntervals(intervals);

    expect(await screen.findByText("CI #7: failure")).toBeInTheDocument();
  });

  it("shows running while CI is in progress", async () => {
    const intervals = await renderSavedEditorWithCi({
      status: "in_progress",
      runNumber: 3,
    });

    await runIntervals(intervals);

    expect(
      await screen.findByText(`CI #3: ${editor.ci.running}`),
    ).toBeInTheDocument();
  });

  it("shows queued while CI is queued", async () => {
    const intervals = await renderSavedEditorWithCi({
      status: "queued",
      runNumber: 5,
    });

    await runIntervals(intervals);

    expect(
      await screen.findByText(`CI #5: ${editor.ci.queued}`),
    ).toBeInTheDocument();
  });

  it("shows not-found copy when no CI run exists yet", async () => {
    const intervals = await renderSavedEditorWithCi({ status: "NOT_FOUND" });

    await runIntervals(intervals);

    expect(await screen.findByText(editor.ci.notFound)).toBeInTheDocument();
  });

  it("does not show a CI message when CI polling returns non-ok", async () => {
    const intervals = await renderSavedEditorWithCi({}, 500);

    await runIntervals(intervals);

    expect(screen.queryByText(/^CI/)).not.toBeInTheDocument();
  });

  it("shows cancelled when CI completes with a cancelled conclusion", async () => {
    const intervals = await renderSavedEditorWithCi({
      status: "completed",
      conclusion: "cancelled",
      runNumber: 9,
    });

    await runIntervals(intervals);

    expect(await screen.findByText("CI #9: cancelled")).toBeInTheDocument();
  });

  it("falls back to localized failed copy when completed has no conclusion", async () => {
    const intervals = await renderSavedEditorWithCi({ status: "completed" });

    await runIntervals(intervals);

    expect(
      await screen.findByText(`CI #?: ${editor.ci.failed}`),
    ).toBeInTheDocument();
  });
});

describe("AdminEditor deploy polling", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function renderSavedEditorWithDeploy(status: string, deployId: string) {
    setFetchMock((input) => {
      const url = String(input);
      if (url === "/api/admin/save") {
        return jsonResponse({ deployId, message: "Saved" });
      }
      if (url.startsWith(`/api/admin/deploy-status?deployId=${deployId}`)) {
        return jsonResponse({ status });
      }
      return defaultLoadResponse();
    });

    await renderEditor();
    const intervals = captureIntervals();
    fireEvent.click(screen.getByRole("button", { name: common.saveToGitHub }));
    expect(await screen.findByText("Saved")).toBeInTheDocument();
    await waitFor(() => expect(intervals.length).toBeGreaterThan(1));
    return intervals;
  }

  it("shows deployed on READY", async () => {
    const intervals = await renderSavedEditorWithDeploy("READY", "dep_123");

    await runIntervals(intervals);

    expect(
      await screen.findByText(`site ${editor.savedAndDeployed}`),
    ).toBeInTheDocument();
  });

  it("shows deploy failed on ERROR", async () => {
    const intervals = await renderSavedEditorWithDeploy("ERROR", "dep_456");

    await runIntervals(intervals);

    expect(
      await screen.findByText(`site ${editor.savedDeployFailed}`),
    ).toBeInTheDocument();
  });

  it("shows deploying during intermediate status", async () => {
    const intervals = await renderSavedEditorWithDeploy("BUILDING", "dep_789");

    await runIntervals(intervals);

    expect(
      await screen.findByText(`site ${editor.deploying}`),
    ).toBeInTheDocument();
  });
});
