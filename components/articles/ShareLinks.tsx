"use client";

import { useEffect, useState } from "react";
import {
  Share2,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Check,
  MessageCircle,
} from "lucide-react";

type Props = {
  url: string;
  title: string;
  summary?: string;
  /** Override the small "Share this article" header text. Set to null to hide. */
  heading?: string | null;
};

const TWITTER_SVG_PATH =
  "M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z";

const REDDIT_SVG_PATH =
  "M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm5.692 11.06c.272-.273.426-.642.426-1.027 0-.797-.65-1.446-1.45-1.446-.385 0-.752.146-1.024.412-.997-.643-2.286-1.014-3.624-1.046l.738-3.474 2.4.51c.027.62.535 1.116 1.158 1.116a1.16 1.16 0 1 0-1.085-1.567l-2.745-.586a.21.21 0 0 0-.245.169l-.815 3.838c-1.36.018-2.659.388-3.667 1.038a1.45 1.45 0 0 0-1.018-.41c-.8 0-1.45.65-1.45 1.446 0 .388.155.755.428 1.025-.062.207-.097.42-.097.638 0 2.234 2.624 4.05 5.857 4.05 3.231 0 5.855-1.816 5.855-4.05 0-.215-.034-.428-.094-.636zm-9.55-.27a1.087 1.087 0 1 1 2.174 0 1.087 1.087 0 0 1-2.174 0zm5.937 2.86c-.516.51-1.347.78-2.475.78-1.131 0-1.961-.27-2.475-.78a.232.232 0 1 1 .328-.328c.41.41 1.16.612 2.147.612.985 0 1.736-.202 2.146-.612a.232.232 0 1 1 .329.328zm-.154-1.776a1.088 1.088 0 0 1 0-2.175 1.088 1.088 0 0 1 0 2.175z";

const FACEBOOK_SVG_PATH =
  "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z";

function BrandSvg({
  path,
  viewBox = "0 0 24 24",
  className = "",
}: {
  path: string;
  viewBox?: string;
  className?: string;
}) {
  return (
    <svg viewBox={viewBox} aria-hidden="true" className={className}>
      <path fill="currentColor" d={path} />
    </svg>
  );
}

type Btn = {
  key: string;
  label: string;
  href?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  newTab?: boolean;
  /** Tailwind color class applied on hover for the icon (brand color). */
  hoverColor: string;
};

export function ShareLinks({ url, title, summary, heading }: Props) {
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const [absoluteUrl, setAbsoluteUrl] = useState(url);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHasNativeShare(typeof navigator?.share === "function");
    // If url was relative, expand to absolute on the client for share targets
    if (url.startsWith("/")) {
      setAbsoluteUrl(`${window.location.origin}${url}`);
    }
  }, [url]);

  const u = encodeURIComponent(absoluteUrl);
  const t = encodeURIComponent(title);
  const body = encodeURIComponent(
    `${summary ? summary + "\n\n" : ""}${absoluteUrl}`
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore — user can long-press the URL bar
    }
  };

  const share = async () => {
    try {
      if (typeof navigator?.share === "function") {
        await navigator.share({ title, text: summary, url: absoluteUrl });
      } else {
        copy();
      }
    } catch {
      // user cancelled
    }
  };

  const buttons: Btn[] = [
    {
      key: "x",
      label: "X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
      icon: <BrandSvg path={TWITTER_SVG_PATH} viewBox="0 0 1200 1227" className="h-3.5 w-3.5" />,
      newTab: true,
      hoverColor: "group-hover:text-white",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: <Linkedin className="h-4 w-4" />,
      newTab: true,
      hoverColor: "group-hover:text-[#0a66c2]",
    },
    {
      key: "reddit",
      label: "Reddit",
      href: `https://www.reddit.com/submit?url=${u}&title=${t}`,
      icon: <BrandSvg path={REDDIT_SVG_PATH} className="h-4 w-4" />,
      newTab: true,
      hoverColor: "group-hover:text-[#ff4500]",
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      icon: <BrandSvg path={FACEBOOK_SVG_PATH} className="h-4 w-4" />,
      newTab: true,
      hoverColor: "group-hover:text-[#1877f2]",
    },
    {
      key: "email",
      label: "Email",
      href: `mailto:?subject=${t}&body=${body}`,
      icon: <Mail className="h-4 w-4" />,
      hoverColor: "group-hover:text-accent",
    },
    {
      key: "sms",
      label: "Message",
      href: `sms:?&body=${body}`,
      icon: <MessageCircle className="h-4 w-4" />,
      hoverColor: "group-hover:text-emerald-400",
    },
  ];

  const headerText =
    heading === undefined ? "Share this article" : heading;

  return (
    <div className="flex flex-col gap-3">
      {headerText !== null && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Share2 className="h-4 w-4" /> {headerText}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <a
            key={b.key}
            href={b.href}
            target={b.newTab ? "_blank" : undefined}
            rel={b.newTab ? "noreferrer noopener" : undefined}
            aria-label={`Share on ${b.label}`}
            title={`Share on ${b.label}`}
            className={[
              "group inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:border-white/30 hover:bg-white/10",
              b.hoverColor,
            ].join(" ")}
          >
            {b.icon}
          </a>
        ))}

        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Link copied" : "Copy link"}
          title={copied ? "Link copied" : "Copy link"}
          className={[
            "inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
            copied
              ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
              : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-accent hover:bg-white/10 hover:text-foreground",
          ].join(" ")}
        >
          {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
        </button>

        {hasNativeShare && (
          <button
            type="button"
            onClick={share}
            aria-label="Share via your device"
            title="Share via your device"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:bg-white/10 hover:text-foreground"
          >
            <Share2 className="h-4 w-4" /> More
          </button>
        )}
      </div>
    </div>
  );
}
