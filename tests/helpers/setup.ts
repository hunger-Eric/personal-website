import "@testing-library/jest-dom/vitest";

// Auto-mock lucide-react for all tests - forwards all exports through
vi.mock("lucide-react", async (importOriginal) => {
  const actual: any = await (importOriginal as any)();
  return actual;
});
