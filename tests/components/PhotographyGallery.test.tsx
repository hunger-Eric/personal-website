// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PhotographyGallery } from "@/components/PhotographyGallery";

// ── Mock next/image ──────────────────────────────────────────────────────────
vi.mock("next/image", () => ({
  default: function MockImage(
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean;
      sizes?: string;
    }
  ) {
    // Extract fill/sizes (not valid on <img>) and pass the rest through
    const { fill, sizes, alt, src, className, style, ...rest } = props;
    return (
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

// ── Mock lucide-react icons ─────────────────────────────────────────────────
vi.mock("lucide-react", () => ({
  Eye: () => <svg data-testid="eye-icon" />,
  EyeOff: () => <svg data-testid="eye-off-icon" />,
  Lock: ({ className }: { className?: string }) => (
    <svg data-testid="lock-icon" className={className} />
  ),
  X: () => <svg data-testid="x-icon" />,
  ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
}));

// ── Mock PhotoPinModal ───────────────────────────────────────────────────────
vi.mock("@/components/PhotoPinModal", () => ({
  PhotoPinModal: ({ open, onClose, onSuccess }: {
    open: boolean;
    onClose: () => void;
    onSuccess: (tokens: Map<string, string>) => void;
  }) =>
    open ? (
      <div data-testid="pin-modal">
        <button data-testid="pin-modal-close" onClick={onClose}>
          Close
        </button>
        <button
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
          Simulate Success
        </button>
      </div>
    ) : null,
}));

// ── Types ────────────────────────────────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function makePhoto(
  overrides: Partial<Photo> = {}
): Photo {
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
  return Array.from({ length: count }, (_, i) =>
    makePhoto({
      id: `public-${i + 1}`,
      title: `Public Photo ${i + 1}`,
      description: `Description for photo ${i + 1}`,
      src: `/photos/public-${i + 1}.jpg`,
      width: 1200,
      height: 800,
      date: "2024-01-15",
      private: false,
    })
  );
}

function createPrivatePhotos(count: number): Photo[] {
  return Array.from({ length: count }, (_, i) =>
    makePhoto({
      id: `private-${i + 1}`,
      title: `Private Photo ${i + 1}`,
      description: `Private description ${i + 1}`,
      src: `/photos/private-${i + 1}.jpg`,
      width: 800,
      height: 1200,
      date: "2024-06-01",
      private: true,
    })
  );
}

// ── SessionStorage mock ──────────────────────────────────────────────────────
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
    getAll: () => Object.fromEntries(store),
  };
}

let mockSessionStorage: ReturnType<typeof createSessionStorageMock>;

// ── Before each ──────────────────────────────────────────────────────────────
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

// ── Tests ────────────────────────────────────────────────────────────────────
describe("PhotographyGallery", () => {
  // ──────── 1. Renders all public photos ────────
  describe("public photo rendering", () => {
    it("renders all public photos with titles and descriptions", () => {
      const photos = createPublicPhotos(3);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      for (const photo of photos) {
        expect(screen.getByText(photo.title)).toBeInTheDocument();
        expect(screen.getByText(photo.description)).toBeInTheDocument();
      }
    });

    it("renders correct number of image elements for public photos", () => {
      const photos = createPublicPhotos(3);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      const images = document.querySelectorAll("img");
      expect(images).toHaveLength(3);
    });

    it("renders photo source URLs on images", () => {
      const photos = createPublicPhotos(2);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      const images = document.querySelectorAll("img");
      expect(images[0]).toHaveAttribute("src", "/photos/public-1.jpg");
      expect(images[1]).toHaveAttribute("src", "/photos/public-2.jpg");
    });

    it("renders photo alt text on images", () => {
      const photos = createPublicPhotos(2);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      const images = document.querySelectorAll("img");
      expect(images[0]).toHaveAttribute("alt", "Public Photo 1");
      expect(images[1]).toHaveAttribute("alt", "Public Photo 2");
    });
  });

  // ──────── 2. Shows "显示私密照片" button when there are private photos ────────
  describe("private photo button visibility", () => {
    it("shows '显示私密照片' button when there are private photos and not authenticated", () => {
      const photos = [...createPublicPhotos(1), ...createPrivatePhotos(1)];
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      expect(screen.getByText("显示私密照片")).toBeInTheDocument();
    });

    it("shows the private photo count badge inside the button", () => {
      const photos = [...createPublicPhotos(1), ...createPrivatePhotos(2)];
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      const button = screen.getByText("显示私密照片");
      // The badge with count should be adjacent in the button
      expect(button.textContent).toContain("2");
    });

    it("shows '隐藏私密照片' button after authenticating", async () => {
      const photos = [...createPublicPhotos(1), ...createPrivatePhotos(1)];
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Click to open PIN modal
      fireEvent.click(screen.getByText("显示私密照片"));

      // Simulate successful PIN entry
      fireEvent.click(screen.getByTestId("pin-modal-success"));

      expect(screen.getByText("隐藏私密照片")).toBeInTheDocument();
      expect(screen.queryByText("显示私密照片")).not.toBeInTheDocument();
    });
  });

  // ──────── 3. Does NOT show the button when all photos are public ────────
  describe("no private photos", () => {
    it("does not render the private photos toggle when all photos are public", () => {
      const photos = createPublicPhotos(3);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      expect(screen.queryByText("显示私密照片")).not.toBeInTheDocument();
      expect(screen.queryByText("隐藏私密照片")).not.toBeInTheDocument();
    });

    it("does not render any control area when all photos are public", () => {
      const photos = createPublicPhotos(2);
      render(
        <PhotographyGallery photos={photos} projectTitle="Test Project" />
      );

      // The controls (toggle button) only appear when hasPrivate is true.
      expect(screen.queryByText("显示私密照片")).not.toBeInTheDocument();
      expect(screen.queryByText("隐藏私密照片")).not.toBeInTheDocument();
    });
  });

  // ──────── 4. Private photos have lock icons ────────
  describe("lock icon on private photos", () => {
    it("renders Lock icon in the title area of private photos when authenticated", () => {
      const photos = [...createPublicPhotos(1), ...createPrivatePhotos(1)];
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Authenticate first so private photos are visible
      fireEvent.click(screen.getByText("显示私密照片"));
      fireEvent.click(screen.getByTestId("pin-modal-success"));

      // Lock icons: there should be at least one for the private photo
      const lockIcons = screen.getAllByTestId("lock-icon");
      // One from the private photo title, possibly none from the image overlay
      // (overlay would also show a Lock but it's behind the image blur condition)
      expect(lockIcons.length).toBeGreaterThanOrEqual(1);
    });

    it("does NOT show Lock icon for public photos", () => {
      const photos = createPublicPhotos(2);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Find the photo card containers for public photos
      const cards = document.querySelectorAll(".group");
      expect(cards).toHaveLength(2);

      // None should contain a lock icon
      const lockIcons = document.querySelectorAll('[data-testid="lock-icon"]');
      expect(lockIcons).toHaveLength(0);
    });
  });

  // ──────── 5. Renders photo title and description ────────
  describe("photo metadata rendering", () => {
    it("renders title for each photo", () => {
      const photos = createPublicPhotos(2);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      expect(screen.getByText("Public Photo 1")).toBeInTheDocument();
      expect(screen.getByText("Public Photo 2")).toBeInTheDocument();
    });

    it("renders description for each photo", () => {
      const photos = createPublicPhotos(2);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      expect(screen.getByText("Description for photo 1")).toBeInTheDocument();
      expect(screen.getByText("Description for photo 2")).toBeInTheDocument();
    });

    it("renders the date for each photo", () => {
      const photos = createPublicPhotos(2);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      const dateElements = screen.getAllByText("2024-01-15");
      expect(dateElements).toHaveLength(2);
    });

    it("handles photos with empty description gracefully", () => {
      const photos = [
        makePhoto({
          id: "no-desc",
          title: "No Description",
          description: "",
          private: false,
        }),
      ];
      const { container } = render(
        <PhotographyGallery photos={photos} projectTitle="Test Project" />
      );

      expect(screen.getByText("No Description")).toBeInTheDocument();
      // Should not render a <p> for description since it's empty/falsy
      // The component checks `photo.description && (...)` — empty string is falsy
      const card = container.querySelector(".break-inside-avoid")!;
      const paragraphs = card.querySelectorAll("p");
      const descParagraphs = Array.from(paragraphs).filter(
        (p) => p.textContent === ""
      );
      expect(descParagraphs).toHaveLength(0);
    });

    it("renders title and description for private photos after auth", () => {
      const photos = createPrivatePhotos(1);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Authenticate
      fireEvent.click(screen.getByText("显示私密照片"));
      fireEvent.click(screen.getByTestId("pin-modal-success"));

      expect(screen.getByText("Private Photo 1")).toBeInTheDocument();
      expect(screen.getByText("Private description 1")).toBeInTheDocument();
    });
  });

  // ──────── 6. Multi-column grid layout ────────
  describe("grid layout", () => {
    it("renders photo grid with multi-column CSS classes", () => {
      const photos = createPublicPhotos(4);
      const { container } = render(
        <PhotographyGallery photos={photos} projectTitle="Test Project" />
      );

      const grid = container.querySelector(".columns-1");
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass("columns-1");
      expect(grid).toHaveClass("sm:columns-2");
      expect(grid).toHaveClass("lg:columns-3");
    });

    it("wraps each photo in a card with break-inside-avoid", () => {
      const photos = createPublicPhotos(3);
      const { container } = render(
        <PhotographyGallery photos={photos} projectTitle="Test Project" />
      );

      const cards = container.querySelectorAll(".break-inside-avoid");
      expect(cards).toHaveLength(3);
    });

    it("does not render any control area when all photos are public", () => {
      const photos = createPublicPhotos(3);
      render(
        <PhotographyGallery photos={photos} projectTitle="Test" />
      );

      // No "显示私密照片" button
      expect(
        screen.queryByText(/显示私密照片/)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/隐藏私密照片/)
      ).not.toBeInTheDocument();
    });

    it("each card has rounded-2xl and border styling", () => {
      const photos = createPublicPhotos(1);
      const { container } = render(
        <PhotographyGallery photos={photos} projectTitle="Test Project" />
      );

      const card = container.querySelector(".rounded-2xl");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("border");
      expect(card).toHaveClass("border-border");
    });

    it("renders grid items with correct aspect ratio style", () => {
      const photos = [
        makePhoto({ id: "p1", width: 16, height: 9, private: false }),
        makePhoto({ id: "p2", width: 4, height: 3, private: false }),
      ];
      const { container } = render(
        <PhotographyGallery photos={photos} projectTitle="Test Project" />
      );

      const buttons = container.querySelectorAll(".group > button");
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveStyle("aspect-ratio: 16/9");
      expect(buttons[1]).toHaveStyle("aspect-ratio: 4/3");
    });
  });

  // ──────── 7. Empty photos state ────────
  describe("empty state", () => {
    it("shows '私密照片已隐藏' when all photos are private and not authenticated", () => {
      const photos = createPrivatePhotos(3);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      expect(screen.getByText("私密照片已隐藏")).toBeInTheDocument();
      expect(screen.getByText("输入 PIN 码查看内容")).toBeInTheDocument();
      expect(screen.getByText("🔒")).toBeInTheDocument();
    });

    it("shows private photos after authentication instead of empty state", () => {
      const photos = createPrivatePhotos(2);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Authenticate
      fireEvent.click(screen.getByText("显示私密照片"));
      fireEvent.click(screen.getByTestId("pin-modal-success"));

      // Empty state should be gone
      expect(screen.queryByText("私密照片已隐藏")).not.toBeInTheDocument();

      // Private photos should now be visible
      expect(screen.getByText("Private Photo 1")).toBeInTheDocument();
      expect(screen.getByText("Private Photo 2")).toBeInTheDocument();
    });

    it("renders empty state when photos array is empty", () => {
      render(<PhotographyGallery photos={[]} projectTitle="Test Project" />);

      // There are no private photos so hasPrivate=false, no button shown.
      // But visiblePhotos is [] (no public photos either), so empty state renders.
      expect(screen.getByText("私密照片已隐藏")).toBeInTheDocument();
      expect(screen.getByText("输入 PIN 码查看内容")).toBeInTheDocument();
    });

    it("does not show empty state when there are public photos", () => {
      const photos = createPublicPhotos(1);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      expect(screen.queryByText("私密照片已隐藏")).not.toBeInTheDocument();
      expect(screen.getByText("Public Photo 1")).toBeInTheDocument();
    });
  });

  // ──────── 8. Lightbox opens/closes on click ────────
  describe("lightbox", () => {
    it("opens lightbox when a photo card is clicked", () => {
      const photos = createPublicPhotos(2);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Click on the first photo
      const photoButtons = document.querySelectorAll(".group > button");
      fireEvent.click(photoButtons[0]);

      // Lightbox should appear with the photo title
      // (card title + lightbox title both render the same text)
      expect(screen.getAllByText("Public Photo 1").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("Description for photo 1").length).toBeGreaterThanOrEqual(2);

      // Lightbox backdrop should be present (fixed overlay)
      const overlay = document.querySelector(".fixed.inset-0");
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass("z-50");
    });

    it("opens lightbox with private photo after auth", () => {
      const photos = createPrivatePhotos(1);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Authenticate first
      fireEvent.click(screen.getByText("显示私密照片"));
      fireEvent.click(screen.getByTestId("pin-modal-success"));

      // Click private photo to open lightbox
      const photoButton = document.querySelector(".group > button");
      fireEvent.click(photoButton!);

      expect(
        screen.getAllByText("Private Photo 1").length
      ).toBeGreaterThanOrEqual(2);
      expect(
        screen.getAllByText("Private description 1").length
      ).toBeGreaterThanOrEqual(2);
    });

    it("closes lightbox when backdrop is clicked", () => {
      const photos = createPublicPhotos(1);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Open lightbox
      const photoButton = document.querySelector(".group > button");
      fireEvent.click(photoButton!);

      expect(screen.getAllByText("Public Photo 1").length).toBeGreaterThanOrEqual(2);

      // Click backdrop to close
      const overlay = document.querySelector(".fixed.inset-0")!;
      fireEvent.click(overlay);

      // Lightbox should close — title should revert to normal
      // (the card title is also "Public Photo 1", but the lightbox's h3 with
      // text-lg class should be gone)
      const lightboxTitle = document.querySelector(
        ".fixed.inset-0 .text-lg"
      );
      expect(lightboxTitle).not.toBeInTheDocument();
    });

    it("closes lightbox when close button is clicked", () => {
      const photos = createPublicPhotos(1);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Open lightbox
      const photoButton = document.querySelector(".group > button");
      fireEvent.click(photoButton!);

      // Close button is the top-right X button with absolute positioning
      const closeButton = document.querySelector(
        ".fixed.inset-0 .absolute.right-4"
      );
      expect(closeButton).toBeInTheDocument();
      fireEvent.click(closeButton!);

      const lightboxTitle = document.querySelector(
        ".fixed.inset-0 .text-lg"
      );
      expect(lightboxTitle).not.toBeInTheDocument();
    });

  it("does NOT close lightbox when the image content area is clicked (stopPropagation)", () => {
    const photos = createPublicPhotos(1);
    render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

    // Open lightbox
    const photoButton = document.querySelector(".group > button");
    fireEvent.click(photoButton!);

    // Click the inner content div (rounded-2xl container) — should NOT close
    const content = document.querySelector(".fixed.inset-0 .rounded-2xl");
    expect(content).toBeInTheDocument();
    fireEvent.click(content!);

    // Lightbox should remain open
    const lightboxTitle = document.querySelector(
      ".fixed.inset-0 .text-lg"
    );
    expect(lightboxTitle).toBeInTheDocument();
  });

    it("renders lightbox image with correct src", () => {
      const photos = createPublicPhotos(1);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Open lightbox
      const photoButton = document.querySelector(".group > button");
      fireEvent.click(photoButton!);

      // The lightbox contains an <img> too
      const images = document.querySelectorAll("img");
      // There's the card image + the lightbox image
      expect(images).toHaveLength(2);
      // The second image is in the lightbox
      expect(images[1]).toHaveAttribute("src", "/photos/public-1.jpg");
      expect(images[1]).toHaveAttribute("alt", "Public Photo 1");
    });

    it("renders private photo with signed URL in lightbox after auth", () => {
      const photos = createPrivatePhotos(1);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Authenticate
      fireEvent.click(screen.getByText("显示私密照片"));
      fireEvent.click(screen.getByTestId("pin-modal-success"));

      // Open lightbox
      const photoButton = document.querySelector(".group > button");
      fireEvent.click(photoButton!);

      // The lightbox image should use signed URL
      const images = document.querySelectorAll("img");
      const lightboxImg = images[images.length - 1];
      expect(lightboxImg).toHaveAttribute(
        "src",
        "/api/photo/private-1?token=token-abc"
      );
    });
  });

  // ──────── 9. sessionStorage token persistence ────────
  describe("sessionStorage token persistence", () => {
    it("restores photo tokens from sessionStorage on mount", () => {
      // Pre-populate sessionStorage with tokens
      const storedTokens: [string, string][] = [
        ["private-1", "token-abc"],
        ["private-2", "token-xyz"],
      ];
      mockSessionStorage.setItem(
        "photography_photo_tokens",
        JSON.stringify(storedTokens)
      );
      mockSessionStorage.setItem("photography_session_token", "true");

      const photos = [...createPublicPhotos(1), ...createPrivatePhotos(2)];
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Should be authenticated on mount — show "隐藏私密照片"
      expect(screen.getByText("隐藏私密照片")).toBeInTheDocument();

      // Private photos should be visible
      expect(screen.getByText("Private Photo 1")).toBeInTheDocument();
      expect(screen.getByText("Private Photo 2")).toBeInTheDocument();
    });

    it("does NOT restore corrupted sessionStorage data", () => {
      // Set corrupted data
      mockSessionStorage.setItem(
        "photography_photo_tokens",
        "not-valid-json{{{"
      );
      mockSessionStorage.setItem("photography_session_token", "true");

      const photos = [...createPublicPhotos(1), ...createPrivatePhotos(1)];
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Should NOT be authenticated — corrupted data is cleared
      expect(screen.getByText("显示私密照片")).toBeInTheDocument();
      expect(screen.queryByText("隐藏私密照片")).not.toBeInTheDocument();

      // Corrupted items should be removed
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        "photography_session_token"
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        "photography_photo_tokens"
      );
    });

    it("persists tokens to sessionStorage after successful PIN entry", () => {
      const photos = [...createPublicPhotos(1), ...createPrivatePhotos(1)];
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Open PIN modal and simulate success
      fireEvent.click(screen.getByText("显示私密照片"));
      fireEvent.click(screen.getByTestId("pin-modal-success"));

      // Verify sessionStorage was written
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "photography_session_token",
        "true"
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "photography_photo_tokens",
        expect.any(String)
      );

      // Verify stored token content
      const storedJson = mockSessionStorage.setItem.mock.calls.find(
        (call) => call[0] === "photography_photo_tokens"
      )?.[1];
      const parsed: [string, string][] = JSON.parse(storedJson as string);
      expect(parsed).toEqual([
        ["private-1", "token-abc"],
        ["private-2", "token-xyz"],
      ]);
    });

    it("clears sessionStorage when '隐藏私密照片' is clicked", () => {
      const photos = [...createPublicPhotos(1), ...createPrivatePhotos(1)];
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Authenticate first
      fireEvent.click(screen.getByText("显示私密照片"));
      fireEvent.click(screen.getByTestId("pin-modal-success"));

      expect(screen.getByText("隐藏私密照片")).toBeInTheDocument();

      // Click to hide
      fireEvent.click(screen.getByText("隐藏私密照片"));

      // SessionStorage should be cleared
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        "photography_session_token"
      );
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        "photography_photo_tokens"
      );

      // Private photos should be hidden again
      expect(screen.getByText("显示私密照片")).toBeInTheDocument();
    });
  });

  // ──────── 10. Private photo signed URL generation ────────
  describe("private photo src URL", () => {
    it("uses signed API URL for private photos when authenticated", () => {
      const photos = createPrivatePhotos(1);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Authenticate
      fireEvent.click(screen.getByText("显示私密照片"));
      fireEvent.click(screen.getByTestId("pin-modal-success"));

      const images = document.querySelectorAll("img");
      expect(images[0]).toHaveAttribute(
        "src",
        "/api/photo/private-1?token=token-abc"
      );
    });

    it("does NOT expose signed URL for private photos when not authenticated", () => {
      const photos = [...createPublicPhotos(1), ...createPrivatePhotos(1)];
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      // Only public photo should be visible
      const images = document.querySelectorAll("img");
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute("src", "/photos/public-1.jpg");
    });
  });

  // ──────── 11. PIN modal interaction ────────
  describe("PIN modal interaction", () => {
    it("opens the PIN modal when '显示私密照片' is clicked", () => {
      const photos = createPrivatePhotos(1);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      fireEvent.click(screen.getByText("显示私密照片"));

      expect(screen.getByTestId("pin-modal")).toBeInTheDocument();
    });

    it("closes the PIN modal when onClose is triggered", () => {
      const photos = createPrivatePhotos(1);
      render(<PhotographyGallery photos={photos} projectTitle="Test Project" />);

      fireEvent.click(screen.getByText("显示私密照片"));
      expect(screen.getByTestId("pin-modal")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("pin-modal-close"));
      expect(screen.queryByTestId("pin-modal")).not.toBeInTheDocument();
    });
  });
});
