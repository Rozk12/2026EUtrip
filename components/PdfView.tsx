"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Load the PDF.js worker from a CDN matching the installed pdfjs-dist version.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface Props {
  file: string;
}

export default function PdfView({ file }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const renderWidth = Math.max(1, width - 16);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-auto overflow-x-hidden bg-[#0b1828]"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {error ? (
        <div className="p-6 text-center text-sm text-[var(--cream-soft)]">
          PDFを読み込めませんでした。
          <br />
          <a
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-[var(--gold)] underline"
          >
            新しいタブで開く
          </a>
        </div>
      ) : (
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(e) => setError(e.message)}
          loading={
            <div className="flex h-40 items-center justify-center font-title text-xs tracking-[0.3em] text-[var(--gold)]">
              LOADING PDF…
            </div>
          }
        >
          {numPages !== null &&
            width > 0 &&
            Array.from({ length: numPages }, (_, i) => (
              <div
                key={i}
                className="mx-auto my-2 flex justify-center"
                style={{ maxWidth: renderWidth }}
              >
                <Page
                  pageNumber={i + 1}
                  width={renderWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="shadow-lg"
                />
              </div>
            ))}
        </Document>
      )}
    </div>
  );
}
