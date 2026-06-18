"use client";

import { documentCopy } from "@/config/copy/document";

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
        className="h-[60vh] w-full rounded-card border border-hairline sm:h-[65vh] md:h-[70vh]"
      >
        <div className="rounded-card border border-hairline p-4 text-sm text-muted-foreground">
          <p>{documentCopy.pdfUnavailable}</p>
          <p>
            <a
              href={src}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent underline"
            >
              {documentCopy.openPdf}
            </a>
            .
          </p>
        </div>
      </object>
    </div>
  );
}
