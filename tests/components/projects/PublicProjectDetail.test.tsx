// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "@/components/LocaleProvider";
import { PublicProjectDetail } from "@/components/projects/PublicProjectDetail";

describe("PublicProjectDetail", () => {
  it("gives reviewed project facts stable citation anchors", () => {
    const { container } = render(
      <LocaleProvider initialLocale="zh">
        <PublicProjectDetail id="hermes-notebook" />
      </LocaleProvider>
    );

    expect(container.querySelector("#project-overview")).toBeInTheDocument();
    expect(container.querySelector("#customer-problem")).toBeInTheDocument();
    expect(container.querySelector("#system-workflow")).toBeInTheDocument();
    expect(container.querySelector("#human-review")).toBeInTheDocument();
    expect(container.querySelector("#delivered-output")).toBeInTheDocument();
    expect(container.querySelector("#usage-boundary")).toBeInTheDocument();
  });
});
