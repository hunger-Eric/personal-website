// components/CommandPalette.tsx
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import {
  Search,
  Home,
  User,
  Briefcase,
  FolderOpen,
  FileText,
  Mail,
  Moon,
  Sun,
  ExternalLink,
  ArrowRight,
  Command,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  category: "page" | "case" | "article" | "action";
  href?: string;
  external?: boolean;
  icon?: ReactNode;
  action?: () => void;
}

interface CommandPaletteProps {
  projects?: Array<{
    id: string;
    name: string;
    summary?: string;
    githubRepoUrl?: string;
    links?: Array<{ type?: string; href: string }>;
  }>;
  articles?: Array<{ slug: string; title: string; summary?: string }>;
}

const STATIC_ITEMS: SearchItem[] = [
  {
    id: "home",
    title: "Home",
    description: "Go to homepage",
    category: "page",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: "about",
    title: "About",
    description: "Learn more about me",
    category: "page",
    href: "/#about",
    icon: <User className="h-4 w-4" />,
  },
  {
    id: "projects",
    title: "Cases",
    description: "Jump to the cases section",
    category: "page",
    href: "/projects",
    icon: <FolderOpen className="h-4 w-4" />,
  },
  {
    id: "articles",
    title: "Articles",
    description: "Read blog posts",
    category: "page",
    href: "/articles",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "resume",
    title: "Resume",
    description: "View my resume",
    category: "page",
    href: "/resume",
    icon: <Briefcase className="h-4 w-4" />,
  },
];

export function CommandPalette({ projects = [], articles = [] }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toggleTheme, resolvedTheme } = useTheme();

  // Build searchable items
  const allItems: SearchItem[] = [
    ...STATIC_ITEMS,
    // Theme toggle action
    {
      id: "toggle-theme",
      title: `Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`,
      description: "Toggle color theme",
      category: "action",
      icon: resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      action: () => {
        toggleTheme();
        setIsOpen(false);
      },
    },
    // Cases: link the searchable entry to the case's external URL
    // (live → repo → first available) since /projects/[slug] no longer exists.
    ...projects.map((p) => {
      const live = p.links?.find((l) => l.type === "live")?.href;
      const repo =
        p.githubRepoUrl ||
        p.links?.find((l) => l.type === "github")?.href;
      const href = live || repo || "/projects";
      return {
        id: `project-${p.id}`,
        title: p.name,
        description: p.summary,
        category: "case" as const,
        href,
        external: href.startsWith("http"),
        icon: <FolderOpen className="h-4 w-4" />,
      };
    }),
    // Articles
    ...articles.map((a) => ({
      id: `article-${a.slug}`,
      title: a.title,
      description: a.summary,
      category: "article" as const,
      href: `/articles/${a.slug}`,
      icon: <FileText className="h-4 w-4" />,
    })),
  ];

  // Setup Fuse.js search
  const fuse = new Fuse(allItems, {
    keys: ["title", "description"],
    threshold: 0.4,
    includeScore: true,
  });

  // Filter results based on query
  const results = query
    ? fuse.search(query).map((r) => r.item)
    : allItems.filter((item) => item.category === "page" || item.category === "action");

  // Keyboard shortcut to open (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        const item = results[selectedIndex];
        if (item.action) {
          item.action();
        } else if (item.href) {
          if (item.external) {
            window.open(item.href, "_blank", "noopener,noreferrer");
          } else {
            router.push(item.href);
          }
          setIsOpen(false);
        }
      }
    },
    [results, selectedIndex, router]
  );

  // Handle item click
  const handleItemClick = (item: SearchItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      if (item.external) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(item.href);
      }
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-accent hover:bg-white/10"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="ml-2 hidden rounded bg-white/10 px-1.5 py-0.5 text-xs font-medium sm:inline">
          <Command className="inline h-3 w-3" />K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 px-4">
        <div
          className="overflow-hidden rounded-xl border border-white/10 bg-background shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, projects, articles..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="rounded bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No results found for &quot;{query}&quot;
              </div>
            ) : (
              <ul>
                {results.map((item, index) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        index === selectedIndex
                          ? "bg-accent/20 text-accent"
                          : "text-foreground hover:bg-white/5"
                      }`}
                    >
                      <span className="flex-shrink-0 text-muted-foreground">
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="truncate text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <span className="flex-shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-xs capitalize text-muted-foreground">
                        {item.category}
                      </span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white/10 px-1.5 py-0.5">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-white/10 px-1.5 py-0.5">↵</kbd>
                Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5">ESC</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default CommandPalette;
