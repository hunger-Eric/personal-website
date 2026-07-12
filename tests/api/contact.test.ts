import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

const validInquiry = {
  name: "Chen",
  email: "chen@example.com",
  company: "Example Logistics",
  workflow: "We copy spreadsheet rows into three systems and manually review every result.",
  frequency: "daily",
  manualTime: "2 people x 4 hours",
  website: "",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
    process.env.CONTACT_TO_EMAIL = "owner@example.com";
    process.env.CONTACT_FROM_EMAIL = "site@example.com";
  });

  it("rejects invalid and bot-shaped submissions", async () => {
    const { POST } = await import("@/app/api/contact/route");
    const response = await POST(new Request("http://localhost/api/contact", { method: "POST", body: JSON.stringify({ ...validInquiry, website: "spam.example" }) }));
    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("sends a reviewed inquiry to the configured mailbox", async () => {
    send.mockResolvedValue({ data: { id: "mail-1" }, error: null });
    const { POST } = await import("@/app/api/contact/route");
    const response = await POST(new Request("http://localhost/api/contact", { method: "POST", body: JSON.stringify(validInquiry) }));
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ replyTo: validInquiry.email, to: "owner@example.com" }));
  });
});
