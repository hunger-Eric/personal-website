// components/BrandGlyphs.tsx
// Shared brand-colored social glyphs used in the navbar primary CTA and
// the /links hub page. Inline SVGs so colors render anywhere without CSS.

export function GithubGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect width="24" height="24" rx="5" fill="#181717" />
      <path
        transform="translate(3 3) scale(0.75)"
        fill="#ffffff"
        d="M12 .5C5.73.5.66 5.57.66 11.84c0 5.02 3.25 9.27 7.76 10.78.57.1.78-.25.78-.55 0-.27-.01-.99-.02-1.94-3.16.69-3.83-1.52-3.83-1.52-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.52-.29-5.18-1.26-5.18-5.62 0-1.24.45-2.26 1.18-3.05-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.16 1.16.92-.26 1.9-.39 2.88-.39s1.96.13 2.88.39c2.2-1.47 3.16-1.16 3.16-1.16.62 1.57.23 2.73.11 3.02.74.79 1.18 1.81 1.18 3.05 0 4.37-2.66 5.33-5.2 5.61.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.66.79.55 4.51-1.51 7.76-5.76 7.76-10.78C23.34 5.57 18.27.5 12 .5Z"
      />
    </svg>
  );
}

export function LinkedInGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect width="24" height="24" rx="3" fill="#0A66C2" />
      <path
        fill="#ffffff"
        d="M7.06 18.6H4.5V9.34h2.56V18.6ZM5.78 8.18a1.49 1.49 0 1 1 0-2.98 1.49 1.49 0 0 1 0 2.98ZM19.5 18.6h-2.56v-4.5c0-1.07-.02-2.45-1.49-2.45-1.5 0-1.73 1.17-1.73 2.37v4.58H11.16V9.34h2.45v1.27h.04c.34-.65 1.18-1.34 2.43-1.34 2.6 0 3.42 1.71 3.42 3.93v5.4Z"
      />
    </svg>
  );
}

export function YoutubeGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect width="24" height="24" rx="5" fill="#FF0000" />
      <path fill="#ffffff" d="M10 8.2v7.6l6.5-3.8L10 8.2Z" />
    </svg>
  );
}

export function InstagramGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="ig-grad-shared" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FBBE3D" />
          <stop offset="35%" stopColor="#E4405F" />
          <stop offset="70%" stopColor="#A535A0" />
          <stop offset="100%" stopColor="#5851D9" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad-shared)" />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.7"
      />
      <circle cx="17.4" cy="6.6" r="1.1" fill="#ffffff" />
    </svg>
  );
}

export function MediumGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect width="24" height="24" rx="5" fill="#000000" />
      <ellipse cx="7" cy="12" rx="3.4" ry="4.6" fill="#ffffff" />
      <ellipse cx="14.6" cy="12" rx="1.6" ry="4.6" fill="#ffffff" />
      <ellipse cx="18.6" cy="12" rx="0.7" ry="4.4" fill="#ffffff" />
    </svg>
  );
}

export function TikTokGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect width="24" height="24" rx="5" fill="#000000" />
      <path
        d="M16.7 6.5c.3 1.7 1.4 2.7 3 2.9v1.9c-1.1.1-2-.2-2.9-.7v4.5c0 2.7-2.2 4.9-4.9 4.9s-4.9-2.2-4.9-4.9 2.2-4.9 4.9-4.9c.3 0 .6 0 .9.1v2c-.3-.1-.6-.2-.9-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V5h1.8Z"
        fill="#25F4EE"
        transform="translate(0.7 0)"
      />
      <path
        d="M16.7 6.5c.3 1.7 1.4 2.7 3 2.9v1.9c-1.1.1-2-.2-2.9-.7v4.5c0 2.7-2.2 4.9-4.9 4.9s-4.9-2.2-4.9-4.9 2.2-4.9 4.9-4.9c.3 0 .6 0 .9.1v2c-.3-.1-.6-.2-.9-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V5h1.8Z"
        fill="#FE2C55"
        transform="translate(-0.7 0)"
      />
      <path
        fill="#ffffff"
        d="M16.7 6.5c.3 1.7 1.4 2.7 3 2.9v1.9c-1.1.1-2-.2-2.9-.7v4.5c0 2.7-2.2 4.9-4.9 4.9s-4.9-2.2-4.9-4.9 2.2-4.9 4.9-4.9c.3 0 .6 0 .9.1v2c-.3-.1-.6-.2-.9-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V5h1.8Z"
      />
    </svg>
  );
}
