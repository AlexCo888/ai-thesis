'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, AlertCircle, Download, RefreshCcw } from 'lucide-react';

interface PdfPaneProps {
  page?: number;
}

export default function PdfPane({ page }: PdfPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/tablet viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle page navigation
  useEffect(() => {
    if (iframeRef.current && page) {
      const base = '/thesis.pdf';
      const timestamp = retryCount > 0 ? `?v=${retryCount}` : '';
      // Use FitV with zoom for mobile, FitH for desktop
      const params = isMobile 
        ? `toolbar=0&navpanes=0&scrollbar=0&page=${page}&view=FitV&zoom=page-fit` 
        : `page=${page}&view=FitH`;
      const newUrl = `${base}${timestamp}#${params}`;
      iframeRef.current.src = newUrl;
    }
  }, [page, retryCount, isMobile]);

  // Retry loading the PDF
  const handleRetry = () => {
    setShowOptions(false);
    setRetryCount((prev) => prev + 1);
  };

  // Download PDF as fallback
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/thesis.pdf';
    link.download = 'thesis.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open in new tab as fallback
  const handleOpenNewTab = () => {
    window.open('/thesis.pdf', '_blank');
  };

  // Build the PDF URL with cache busting
  const pdfUrl = (() => {
    const timestamp = retryCount > 0 ? `?v=${retryCount}` : '';
    // Use FitV with zoom for mobile to prevent scrollbars, FitH for desktop
    // Also add toolbar=0 to hide PDF toolbar on mobile
    const params = isMobile 
      ? (page ? `toolbar=0&navpanes=0&scrollbar=0&page=${page}&view=FitV&zoom=page-fit` : `toolbar=0&navpanes=0&scrollbar=0&view=FitV&zoom=page-fit`)
      : (page ? `page=${page}&view=FitH` : `view=FitH`);
    return `/thesis.pdf${timestamp}#${params}`;
  })();

  return (
    <div className="relative w-full h-full bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 touch-pan-y touch-pan-x" style={{ overflow: 'hidden' }}>
      {/* Fallback Options - Show on demand */}
      {showOptions && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm z-20 p-6">
          <AlertCircle className="h-14 w-14 text-orange-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            PDF Not Displaying?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
            Try one of these options to view the PDF:
          </p>
          
          <div className="flex flex-col gap-2.5 w-full max-w-sm">
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              <RefreshCcw className="h-4 w-4" />
              Reload PDF {retryCount > 0 && `(Attempt ${retryCount + 1})`}
            </button>
            
            <button
              onClick={handleOpenNewTab}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              <FileText className="h-4 w-4" />
              Open in New Tab
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>

            <button
              onClick={() => setShowOptions(false)}
              className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              Close and try again
            </button>
          </div>

          {retryCount >= 1 && (
            <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200 max-w-md">
              <p className="font-medium mb-1.5">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Chrome and Edge have the best PDF support</li>
                <li>Check your browser&apos;s PDF viewer settings</li>
                <li>Try disabling extensions temporarily</li>
                <li>Use &quot;Open in New Tab&quot; for native PDF viewer</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Help button - Always visible */}
      <button
        onClick={() => setShowOptions(true)}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-105"
        title="PDF not loading? Click for options"
        aria-label="PDF loading help"
      >
        <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </button>

      {/* PDF Iframe - Always visible */}
      <div 
        className="w-full h-full" 
        style={{ 
          overflow: isMobile ? 'hidden' : 'auto',
          position: 'relative'
        }}
      >
        <iframe
          ref={iframeRef}
          key={`pdf-viewer-${retryCount}`}
          title="Thesis PDF Viewer"
          src={pdfUrl}
          className="w-full h-full border-0 bg-white dark:bg-gray-950"
          style={{
            minHeight: '100%',
            height: '100%',
            width: '100%',
            maxWidth: '100%',
            display: 'block',
            border: 'none',
            margin: 0,
            padding: 0,
            objectFit: isMobile ? 'contain' : 'initial'
          }}
          allow="fullscreen"
          loading="lazy"
        />
      </div>
    </div>
  );
}
