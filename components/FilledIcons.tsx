// components/FilledIcons.tsx
// Solid (filled) glyphs that take currentColor — used for action buttons and
// the footer where line-art Lucide icons looked too thin.

type IconProps = { className?: string };

export function FilledGithub({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 .5C5.73.5.66 5.57.66 11.84c0 5.02 3.25 9.27 7.76 10.78.57.1.78-.25.78-.55 0-.27-.01-.99-.02-1.94-3.16.69-3.83-1.52-3.83-1.52-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.52-.29-5.18-1.26-5.18-5.62 0-1.24.45-2.26 1.18-3.05-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.16 1.16.92-.26 1.9-.39 2.88-.39s1.96.13 2.88.39c2.2-1.47 3.16-1.16 3.16-1.16.62 1.57.23 2.73.11 3.02.74.79 1.18 1.81 1.18 3.05 0 4.37-2.66 5.33-5.2 5.61.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.66.79.55 4.51-1.51 7.76-5.76 7.76-10.78C23.34 5.57 18.27.5 12 .5Z"
      />
    </svg>
  );
}

export function FilledGlobe({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 7H16.4a14.83 14.83 0 0 0-1.45-3.84A8.04 8.04 0 0 1 18.93 9ZM12 4.04c.7.96 1.65 2.6 2.27 4.96H9.73C10.35 6.64 11.3 5 12 4.04ZM4.26 13a8.07 8.07 0 0 1 0-2h2.86c-.06.66-.12 1.32-.12 2 0 .68.06 1.34.12 2H4.26Zm.81 2h2.52c.31 1.42.78 2.7 1.4 3.84A8.04 8.04 0 0 1 5.07 15Zm2.52-6H5.07a8.04 8.04 0 0 1 3.91-3.84A14.83 14.83 0 0 0 7.59 9Zm4.41 11c-.7-.96-1.65-2.6-2.27-4.96h4.54C13.65 17.4 12.7 19.04 12 20Zm2.62-6.96H9.38c-.07-.66-.13-1.32-.13-2 0-.68.06-1.34.13-2h5.24c.07.66.13 1.32.13 2 0 .68-.06 1.34-.13 2Zm.33 5.84c.62-1.14 1.09-2.42 1.4-3.84h2.52a8.04 8.04 0 0 1-3.92 3.84ZM16.88 13c.06-.66.12-1.32.12-2 0-.68-.06-1.34-.12-2h2.86a8.07 8.07 0 0 1 0 4h-2.86Z"
      />
    </svg>
  );
}

export function FilledFileText({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M6 2.5h7l5 5v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2Zm7 1.5v3.5a1 1 0 0 0 1 1H17.5L13 4Zm-5 9.5h8v1.5H8v-1.5Zm0 3h8v1.5H8v-1.5Zm0-6h5v1.5H8V10Z"
      />
    </svg>
  );
}

export function FilledDownload({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M11 3h2v9.17l3.59-3.58L18 10l-6 6-6-6 1.41-1.41L11 12.17V3ZM5 19h14v2H5v-2Z"
      />
    </svg>
  );
}

export function FilledPlay({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M8 5.14v13.72c0 .76.83 1.22 1.47.83l11.05-6.86a.97.97 0 0 0 0-1.66L9.47 4.31C8.83 3.92 8 4.38 8 5.14Z"
      />
    </svg>
  );
}

export function FilledMapPin({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2c-3.86 0-7 3.14-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
      />
    </svg>
  );
}

export function FilledArrowUpRight({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M7 4h13v13h-2.5V8.27L5.77 19.99 4 18.23 15.73 6.5H7V4Z"
      />
    </svg>
  );
}
