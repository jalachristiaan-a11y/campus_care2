import { useEffect, useRef, useState } from 'react';
import { apiRequest } from './apiClient.js';
import CorPreviewModal from './CorPreviewModal.jsx';

export default function StudentVerification({ user, onComplete, onBack }) {
  const corInputRef = useRef(null);
  const [code, setCode] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [corStatus, setCorStatus] = useState(user?.corStatus || 'pending');
  const [corSubmitted, setCorSubmitted] = useState(Boolean(user?.corSubmitted));
  const [corFileName, setCorFileName] = useState(user?.corFileName || '');
  const [corStatusMessage, setCorStatusMessage] = useState('');
  const [corDocument, setCorDocument] = useState(null);
  const [corPreviewOpen, setCorPreviewOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [corBusy, setCorBusy] = useState(false);
  const [emailVerified, setEmailVerified] = useState(Boolean(user?.emailVerified));

  useEffect(() => {
    let active = true;
    apiRequest('/api/auth/cor')
      .then((result) => {
        if (!active) return;
        setCorDocument(result.document);
        if (result.document) {
          setCorSubmitted(true);
          setCorFileName(result.document.name);
        }
      })
      .catch((error) => {
        if (active) {
          setCorStatusMessage(error instanceof Error ? error.message : 'Unable to load your submitted COR.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!corBusy) {
      apiRequest('/api/auth/session')
        .then((result) => {
          if (!active) return;
          setEmailVerified(Boolean(result.user.emailVerified));
          setCorStatus(result.user.corStatus);
          setCorSubmitted(Boolean(result.user.corSubmitted));
          setCorFileName(result.user.corFileName || '');
        })
        .catch(() => {});
    }
    const intervalId = window.setInterval(() => {
      apiRequest('/api/auth/session')
        .then((result) => {
          if (!active) return;
          setEmailVerified(Boolean(result.user.emailVerified));
          setCorStatus(result.user.corStatus);
          setCorSubmitted(Boolean(result.user.corSubmitted));
          setCorFileName(result.user.corFileName || '');
        })
        .catch(() => {});
    }, 10000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [corBusy]);

  const sendCode = async () => {
    setBusy(true);
    setEmailStatus('');
    try {
      const result = await apiRequest('/api/auth/verification/send', { method: 'POST' });
      setEmailStatus(result.message);
    } catch (error) {
      setEmailStatus(error instanceof Error ? error.message : 'Unable to send the verification code.');
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    setEmailStatus('');
    try {
      const result = await apiRequest('/api/auth/verification/verify', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      setEmailStatus(result.message);
      setEmailVerified(true);
    } catch (error) {
      setEmailStatus(error instanceof Error ? error.message : 'Unable to verify the code.');
    } finally {
      setBusy(false);
    }
  };

  const submitCor = async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      setCorStatusMessage('Upload a JPEG, PNG, WebP, or PDF COR.');
      event.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setCorStatusMessage('The COR must be 2 MB or smaller.');
      event.target.value = '';
      return;
    }

    setCorBusy(true);
    setCorStatusMessage('');
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        if (typeof reader.result !== 'string') {
          throw new Error('Unable to read the selected COR.');
        }
        const result = await apiRequest('/api/auth/cor', {
          method: 'POST',
          body: JSON.stringify({
            document: { name: file.name, type: file.type, data: reader.result },
          }),
        });
        setCorStatus(result.corStatus);
        setCorSubmitted(Boolean(result.corSubmitted));
        setCorFileName(result.corFileName || file.name);
        setCorDocument({ name: file.name, type: file.type, data: reader.result });
        setCorStatusMessage(result.message);
      } catch (error) {
        setCorStatusMessage(error instanceof Error ? error.message : 'Unable to submit the COR.');
      } finally {
        setCorBusy(false);
        if (corInputRef.current) corInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setCorStatusMessage('Unable to read the selected COR.');
      setCorBusy(false);
    };
    reader.readAsDataURL(file);
  };

  const corApproved = corStatus === 'approved';
  const complete = emailVerified && corApproved;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Account Verification</h1>
        <p className="mt-1 text-sm text-slate-500">
          Verify your WMSU email and submit your Certificate of Registration before filing complaints.
        </p>

        <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 p-4">
          <h2 className="font-bold text-slate-800">1. Verify WMSU Email</h2>
          <button type="button" onClick={sendCode} disabled={busy || emailVerified} className="rounded-lg bg-[#800020] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? 'Working…' : 'Send verification code'}
          </button>
          <form onSubmit={verifyCode} className="flex gap-2">
            <input
              name="verification-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
              disabled={emailVerified}
            />
            <button type="submit" disabled={busy || emailVerified || code.length !== 6} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60">
              Verify
            </button>
          </form>
          {emailStatus && <p role="status" className="text-sm text-slate-600">{emailStatus}</p>}
          {emailVerified && <p className="text-sm font-semibold text-emerald-700">Email verified.</p>}
        </div>

        <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 p-4">
          <h2 className="font-bold text-slate-800">2. Submit COR</h2>
          <label
            htmlFor="student-cor-upload"
            className="inline-flex cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {corSubmitted ? 'Replace COR file' : 'Choose COR file'}
          </label>
          <input
            ref={corInputRef}
            id="student-cor-upload"
            className="sr-only"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            onChange={submitCor}
            disabled={corBusy || corApproved}
          />
          {corStatusMessage && <p role="status" className="text-sm text-slate-600">{corStatusMessage}</p>}
          {corSubmitted && corFileName && <p className="break-all text-sm text-slate-600">Submitted file: {corFileName}</p>}
          {corDocument && (
            <button
              type="button"
              onClick={() => setCorPreviewOpen(true)}
              className="text-sm font-semibold text-[#800020] underline"
            >
              Review submitted COR
            </button>
          )}
          {!corSubmitted && <p className="text-sm text-slate-500">No COR has been submitted yet.</p>}
          {corSubmitted && corStatus === 'pending' && <p className="text-sm text-amber-700">COR submitted. Waiting for administrator approval.</p>}
          {corSubmitted && corStatus === 'rejected' && <p className="text-sm text-rose-700">COR was rejected. Please upload a corrected copy.</p>}
          {corApproved && <p className="text-sm font-semibold text-emerald-700">COR approved.</p>}
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <button type="button" onClick={onBack} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Log Out</button>
          <button type="button" onClick={onComplete} disabled={!complete} className="rounded-lg bg-[#800020] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Continue
          </button>
        </div>
      </section>
      {corPreviewOpen && corDocument && (
        <CorPreviewModal
          document={corDocument}
          onClose={() => setCorPreviewOpen(false)}
          allowDownload={false}
        />
      )}
    </main>
  );
}
