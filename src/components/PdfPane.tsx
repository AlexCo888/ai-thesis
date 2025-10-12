'use client';

import { useEffect, useRef } from 'react';

export default function PdfPane({ page }: { page?: number }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (ref.current && page) {
      // Reload iframe only when page changes to keep it simple and robust
      const base = '/thesis.pdf';
      ref.current.src = `${base}#page=${page}&view=FitH`;
    }
  }, [page]);

  return (
    <iframe
      ref={ref}
      title="Thesis PDF"
      src="/thesis.pdf#view=FitH"
      className="w-full h-full border rounded-md"
    />
  );
}
