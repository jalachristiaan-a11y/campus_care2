import { useEffect, useState } from 'react';

export default function CorPreviewModal({ document, onClose, allowDownload = true }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl;
    fetch(document.data)
      .then((response) => response.blob())
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (active) setPreviewUrl(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        if (active) setPreviewError('Unable to preview this COR. Try downloading the file instead.');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cor-preview-title"
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h2 id="cor-preview-title" className="min-w-0 break-all text-sm font-bold text-slate-900">
            {document.name}
          </h2>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold">
            Close
          </button>
        </header>
        {previewError ? (
          <p role="alert" className="p-6 text-sm text-rose-700">{previewError}</p>
        ) : !previewUrl ? (
          <p role="status" className="p-6 text-sm text-slate-500">Loading COR preview…</p>
        ) : document.type === 'application/pdf' ? (
          <iframe title={`COR preview: ${document.name}`} src={previewUrl} className="h-[75vh] w-full" />
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-100 p-4">
            <img src={previewUrl} alt={`COR: ${document.name}`} className="max-h-[75vh] max-w-full object-contain" />
          </div>
        )}
        {allowDownload && previewUrl && (
          <a href={previewUrl} download={document.name} className="border-t border-slate-200 px-4 py-3 text-center text-xs font-bold text-[#800020] underline">
            Download COR
          </a>
        )}
      </section>
    </div>
  );
}
