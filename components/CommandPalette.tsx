// components/CommandPalette.tsx
"use client";

import {
  useState,
  useEffect,
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
  Moon,
  Sun,
  ArrowRight,
  Command,
} from "lucide-react";
import { getSiteCopy } from "@/config/contentCopy";
import { useLocale } from "./LocaleProvider";
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

const STATIC_ITEM_META: Record<
  "home" | "about" | "projects" | "articles" | "resume",
  { href: string; icon: ReactNode }
> = {
  home: { href: "/", icon: <Home className="h-4 w-4" /> },
  about: { href: "/#about", icon: <User className="h-4 w-4" /> },
  projects: { href: "/projects", icon: <FolderOpen className="h-4 w-4" /> },
  articles: { href: "/articles", icon: <FileText className="h-4 w-4" /> },
  resume: { href: "/resume", icon: <Briefcase className="h-4 w-4" /> },
};

export function CommandPalette({
  projects = [],
  articles = [],
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toggleTheme, resolvedTheme } = useTheme();
  const { locale } = useLocale();
  const copy = getSiteCopy(locale).commandPalette;

  const staticItems: SearchItem[] = copy.staticItems.map((item) => ({
    ...item,
    category: "page" as const,
    href: STATIC_ITEM_META[item.id].href,
    icon: STATIC_ITEM_META[item.id].icon,
  }));

  const allItems: SearchItem[] = [
    ...staticItems,
    {
      id: "toggle-theme",
      title:
        resolvedTheme === "dark"
          ? copy.nextMode.light
          : copy.nextMode.dark,
      description: copy.toggleThemeDescription,
      category: "action",
      icon:
        resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        ),
      action: () => {
        toggleTheme();
        setIsOpen(false);
      },
    },
    ...projects.map((project) => {
      const live = project.links?.find((link) => link.type === "live")?.href;
      const repo =
        project.githubRepoUrl ||
        project.links?.find((link) => link.type === "github")?.href;
      const href = live || repo || "/projects";

      return {
        id: `project-${project.id}`,
        title: project.name,
        description: project.summary,
        category: "case" as const,
        href,
        external: href.startsWith("http"),
        icon: <FolderOpen className="h-4 w-4" />,
      };
    }),
    ...articles.map((article) => ({
      id: `article-${article.slug}`,
      title: article.title,
      description: article.summary,
      category: "article" as const,
      href: `/articles/${article.slug}`,
      icon: <FileText className="h-4 w-4" />,
    })),
  ];

  const fuse = new Fuse(allItems, {
    keys: ["title", "description"],
    threshold: 0.4,
    includeScore: true,
  });

  const results = query
    ? fuse.search(query).map((result) => result.item)
    : allItems.filter(
        (item) => item.category === "page" || item.category === "action"
      );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen((prev) => {
          if (!prev) {
            setQuery("");
            setSelectedIndex(0);
          }
          return !prev;
        });
      }

      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const openPalette = () => {
    setQuery("");
    setSelectedIndex(0);
    setIsOpen(true);
  };

  const selectItem = (item: SearchItem) => {
    if (item.action) {
      item.action();
      return;
    }

    if (!item.href) return;

    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else {
      router.push(item.href);
    }

    setIsOpen(false);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && results[selectedIndex]) {
      event.preventDefault();
      selectItem(results[selectedIndex]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={openPalette}
        className="flex items-center gap-2 rounded-control border border-border bg-surface-paper px-3 py-1.5 text-sm text-muted-foreground shadow-card transition-colors hover:border-accent/60 hover:bg-muted"
        aria-label={copy.openLabel}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">{copy.searchTrigger}</span>
        <kbd className="ml-2 hidden rounded-control border border-border bg-muted px-1.5 py-0.5 text-xs font-medium sm:inline">
          <Command className="inline h-3 w-3" />K
        </kbd>
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-surface-graphite/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 px-4">
        <div
          className="overflow-hidden rounded-panel border border-border bg-surface-paper-elevated shadow-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={copy.dialogLabel}
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={copy.searchPlaceholder}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="rounded-control border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                {copy.noResultsPrefix} &quot;{query}&quot;
                {copy.noResultsSuffix ? ` ${copy.noResultsSuffix}` : ""}
              </div>
            ) : (
              <ul>
                {results.map((item, index) => (
                  <li key={item.id}>
                    <button
                      onClick={() => selectItem(item)}
                      className={`flex w-full items-center gap-3 rounded-control px-3 py-2 text-left transition-colors ${
                        index === selectedIndex
                          ? "bg-accent/15 text-accent"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="flex-shrink-0 text-muted-foreground">
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="truncate text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <span className="flex-shrink-0 rounded-control border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {copy.categoryLabels[item.category]}
                      </span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded-control border border-border bg-muted px-1.5 py-0.5">
                  Up/Down
                </kbd>
                {copy.footer.navigate}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded-control border border-border bg-muted px-1.5 py-0.5">
                  Enter
                </kbd>
                {copy.footer.select}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded-control border border-border bg-muted px-1.5 py-0.5">
                ESC
              </kbd>
              {copy.footer.close}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default CommandPalette;
