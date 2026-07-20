import React, { useState } from 'react';
import { uploadReceiptAPI } from '../services/apiService';

interface ReceiptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported?: (parsed: any) => void;
}

const ReceiptUploadModal: React.FC<ReceiptUploadModalProps> = ({ isOpen, onClose, onImported }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // Try to perform client-side OCR using tesseract.js if available
      let ocrText = '';
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker({ logger: (m: any) => {} });
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data } = await worker.recognize(file);
        ocrText = data?.text || '';
        await worker.terminate();
      } catch (ocrErr) {
        // tesseract not available or failed — fallback silently to server-side parsing
        console.warn('Client OCR failed or is not available, falling back to server OCR', ocrErr);
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const resp: any = await uploadReceiptAPI(base64, ocrText || '');
      setResult(resp.parsed || resp);
      onImported && onImported(resp.parsed || resp);
    } catch (err: any) {
      console.error(err);
      setResult({ error: err?.message || 'Failed to parse' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md bg-[#0b0b0d] p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4">Upload Receipt</h3>
        <div className="space-y-3">
          <input type="file" accept="image/*,.png,.jpg,.jpeg,.pdf" onChange={(e) => handleFile(e.target.files?.[0])} />
          {preview && <img src={preview} alt="preview" className="w-full rounded-md mt-2" />}
          <div className="flex gap-2 mt-4">
            <button onClick={handleUpload} disabled={loading || !file} className="bg-indigo-600 text-white px-4 py-2 rounded-xl">{loading ? 'Parsing...' : 'Parse Receipt'}</button>
            <button onClick={onClose} className="bg-zinc-800 text-zinc-200 px-4 py-2 rounded-xl">Cancel</button>
          </div>
          {result && (
            <div className="mt-4 text-sm bg-white/5 p-3 rounded-lg">
              <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptUploadModal;
