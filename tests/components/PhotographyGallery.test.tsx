// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PhotographyGallery } from "@/components/PhotographyGallery";

vi.mock("next/image", () => ({
  default: function MockImage(
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean;
      sizes?: string;
    }
  ) {
    const { fill, sizes, alt, src, className, style, ...rest } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src as string}
        alt={alt ?? ""}
        className={className}
        style={style}
        data-fill={fill ? "true" : undefined}
        data-sizes={sizes}
        {...rest}
      />
    );
  },
}));

vi.mock("lucide-react", () => ({
  Camera: ({ className }: { className?: string }) => (
    <svg data-testid="camera-icon" className={className} />
  ),
  ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
  Eye: () => <svg data-testid="eye-icon" />,
  EyeOff: () => <svg data-testid="eye-off-icon" />,
  Lock: ({ className }: { className?: string }) => (
    <svg data-testid="lock-icon" className={className} />
  ),
  X: () => <svg data-testid="x-icon" />,
}));

vi.mock("@/components/PhotoPinModal", () => ({
  PhotoPinModal: ({
    open,
    onClose,
    onSuccess,
  }: {
    open: boolean;
    onClose: () => void;
    onSuccess: (tokens: Map<string, string>) => void;
  }) =>
    open ? (
      <div data-testid="pin-modal">
        <button type="button" data-testid="pin-modal-close" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          data-testid="pin-modal-success"
          onClick={() =>
            onSuccess(
              new Map([
                ["private-1", "token-abc"],
                ["private-2", "token-xyz"],
              ])
            )
          }
        >
          Simulate success
        </button>
      </div>
    ) : null,
}));

type Photo = {
  id: string;
  title: string;
  description: string;
  src: string;
  width: number;
  height: number;
  date: string;
  private: boolean;
};

function makePhoto(overrides: Partial<Photo> = {}): Photo {
  return {
    id: "photo-1",
    title: "Default Photo Title",
    description: "A beautiful photo description.",
    src: "/photos/default.jpg",
    width: 1200,
    height: 800,
    date: "2024-01-15",
    private: false,
    ...overrides,
  };
}

function createPublicPhotos(count: number): Photo[] {
  return Array.from({ length: count }, (_, index) =>
    makePhoto({
      id: `public-${index + 1}`,
      title: `Public Photo ${index + 1}`,
      description: `Description for photo ${index + 1}`,
      src: `/photos/public-${index + 1}.jpg`,
    })
  );
}

function createPrivatePhotos(count: number): Photo[] {
  return Array.from({ length: count }, (_, index) =>
    makePhoto({
      id: `private-${index + 1}`,
      title: `Private Photo ${index + 1}`,
      description: `Private description ${index + 1}`,
      src: `/photos/private-${index + 1}.jpg`,
      width: 800,
      height: 1200,
      date: "2024-06-01",
      private: true,
    })
  );
}

function createSessionStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => store.clear()),
    get length() {
      return store.size;
    },
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
  };
}

let mockSessionStorage: ReturnType<typeof createSessionStorageMock>;

beforeEach(() => {
  vi.clearAllMocks();
  mockSessionStorage = createSessionStorageMock();
  Object.defineProperty(window, "sessionStorage", {
    value: mockSessionStorage,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
});

describe("PhotographyGallery", () => {
  it("renders public photos with metadata and image sources", () => {
    const photos = createPublicPhotos(2);
    render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

    expect(screen.getByText("Public Photo 1")).toBeInTheDocument();
    expect(screen.getByText("Description for photo 2")).toBeInTheDocument();

    const images = document.querySelectorAll("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "/photos/public-1.jpg");
    expect(images[0]).toHaveAttribute("alt", "Public Photo 1");
  });

  it("uses semantic gallery cards without template residue classes", () => {
    const photos = createPublicPhotos(1);
    const { container } = render(
      <PhotographyGallery photos={photos} projectTitle="Test Project" />
    );

    const card = container.querySelector("article.break-inside-avoid");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("rounded-card");
    expect(container.querySelector(".rounded-2xl")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-card")).not.toBeInTheDocument();
  });

  it("keeps the masonry layout and aspect-ratio controls", () => {
    const photos = [
      makePhoto({ id: "p1", width: 16, height: 9 }),
      makePhoto({ id: "p2", width: 4, height: 3 }),
    ];
    const { container } = render(
      <PhotographyGallery photos={photos} projectTitle="Test Project" />
    );

    const grid = container.querySelector(".columns-1");
    expect(grid).toHaveClass("sm:columns-2");
    expect(grid).toHaveClass("lg:columns-3");

    const buttons = container.querySelectorAll("article > button");
    expect(buttons[0]).toHaveStyle("aspect-ratio: 16/9");
    expect(buttons[1]).toHaveStyle("aspect-ratio: 4/3");
  });

  it("shows the private-photo unlock action only when private photos exist", () => {
    const photos = [...createPublicPhotos(1), ...createPrivatePhotos(2)];
    render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

    const button = screen.getByRole("button", { name: /显示私密照片/ });
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain("2");
  });

  it("does not show private controls for public-only galleries", () => {
    render(
      <PhotographyGallery photos={createPublicPhotos(2)} projectTitle="Test Project" />
    );

    expect(screen.queryByText("显示私密照片")).not.toBeInTheDocument();
    expect(screen.queryByText("隐藏私密照片")).not.toBeInTheDocument();
  });

  it("unlocks private photos and stores signed tokens in sessionStorage", () => {
    const photos = [...createPublicPhotos(1), ...createPrivatePhotos(1)];
    render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

    fireEvent.click(screen.getByText("显示私密照片"));
    fireEvent.click(screen.getByTestId("pin-modal-success"));

    expect(screen.getByText("隐藏私密照片")).toBeInTheDocument();
    expect(screen.getByText("Private Photo 1")).toBeInTheDocument();
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      "photography_session_token",
      "true"
    );
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      "photography_photo_tokens",
      expect.any(String)
    );
  });

  it("restores private access from sessionStorage", () => {
    mockSessionStorage.setItem(
      "photography_photo_tokens",
      JSON.stringify([
        ["private-1", "token-abc"],
        ["private-2", "token-xyz"],
      ])
    );
    mockSessionStorage.setItem("photography_session_token", "true");

    const photos = [...createPublicPhotos(1), ...createPrivatePhotos(2)];
    render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

    expect(screen.getByText("隐藏私密照片")).toBeInTheDocument();
    expect(screen.getByText("Private Photo 2")).toBeInTheDocument();
  });

  it("clears corrupted sessionStorage data", () => {
    mockSessionStorage.setItem("photography_photo_tokens", "not-valid-json{{{");
    mockSessionStorage.setItem("photography_session_token", "true");

    const photos = [...createPublicPhotos(1), ...createPrivatePhotos(1)];
    render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

    expect(screen.getByText("显示私密照片")).toBeInTheDocument();
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
      "photography_session_token"
    );
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
      "photography_photo_tokens"
    );
  });

  it("hides private photos again and clears storage", () => {
    const photos = [...createPublicPhotos(1), ...createPrivatePhotos(1)];
    render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

    fireEvent.click(screen.getByText("显示私密照片"));
    fireEvent.click(screen.getByTestId("pin-modal-success"));
    fireEvent.click(screen.getByText("隐藏私密照片"));

    expect(screen.getByText("显示私密照片")).toBeInTheDocument();
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
      "photography_session_token"
    );
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
      "photography_photo_tokens"
    );
  });

  it("renders the private hidden empty state for private-only galleries", () => {
    render(
      <PhotographyGallery photos={createPrivatePhotos(2)} projectTitle="Test Project" />
    );

    expect(screen.getByText("私密照片已隐藏")).toBeInTheDocument();
    expect(screen.getByText(/输入 PIN 码查看/)).toBeInTheDocument();
    expect(screen.getByTestId("camera-icon")).toBeInTheDocument();
  });

  it("renders the no-photo empty state for empty galleries", () => {
    render(<PhotographyGallery photos={[]} projectTitle="Test Project" />);

    expect(screen.getByText("暂无照片")).toBeInTheDocument();
    expect(screen.getByText("这个影像档案还没有公开照片。")).toBeInTheDocument();
  });

  it("opens and closes the lightbox", () => {
    render(
      <PhotographyGallery photos={createPublicPhotos(1)} projectTitle="Test Project" />
    );

    fireEvent.click(document.querySelector("article > button")!);
    expect(screen.getAllByText("Public Photo 1").length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getByLabelText("关闭"));
    expect(document.querySelector(".fixed.inset-0 .text-lg")).not.toBeInTheDocument();
  });

  it("keeps the lightbox open when image content is clicked", () => {
    render(
      <PhotographyGallery photos={createPublicPhotos(1)} projectTitle="Test Project" />
    );

    fireEvent.click(document.querySelector("article > button")!);
    fireEvent.click(document.querySelector(".fixed.inset-0 .rounded-card")!);

    expect(document.querySelector(".fixed.inset-0 .text-lg")).toBeInTheDocument();
  });

  it("uses signed API URLs for private photos after unlock", () => {
    render(
      <PhotographyGallery photos={createPrivatePhotos(1)} projectTitle="Test Project" />
    );

    fireEvent.click(screen.getByText("显示私密照片"));
    fireEvent.click(screen.getByTestId("pin-modal-success"));

    const images = document.querySelectorAll("img");
    expect(images[0]).toHaveAttribute(
      "src",
      "/api/photo/private-1?token=token-abc"
    );
  });

  it("does not expose private image URLs before unlock", () => {
    const photos = [...createPublicPhotos(1), ...createPrivatePhotos(1)];
    render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

    const images = document.querySelectorAll("img");
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute("src", "/photos/public-1.jpg");
  });

  it("opens and closes the PIN modal", () => {
    render(
      <PhotographyGallery photos={createPrivatePhotos(1)} projectTitle="Test Project" />
    );

    fireEvent.click(screen.getByText("显示私密照片"));
    expect(screen.getByTestId("pin-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("pin-modal-close"));
    expect(screen.queryByTestId("pin-modal")).not.toBeInTheDocument();
  });
});
