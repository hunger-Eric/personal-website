"use client";

type PdfEmbedProps = {
  src: string; // e.g. "/api/resume"
  className?: string;
};

export default function PdfEmbed({ src, className }: PdfEmbedProps) {
  return (
    <div className={className ?? ""}>
      <object
        data={src}
        type="application/pdf"
        className="w-full h-[60vh] sm:h-[65vh] md:h-[70vh] rounded-lg border border-white/10"
      >
        <div className="rounded-lg border border-white/10 p-4 text-sm text-muted-foreground">
          <p>Your browser can’t display PDFs inline.</p>
          <p>
            <a
              href={src}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent underline"
            >
              Open the PDF in a new tab
            </a>
            .
          </p>
        </div>
      </object>
    </div>
  );
}
