import { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Smartphone, ScanLine, Download, Upload, ArrowLeftRight } from 'lucide-react';

function encodeData(data: Record<string, unknown>): string {
  const json = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json)));
}

function decodeData(encoded: string): Record<string, unknown> {
  const json = decodeURIComponent(escape(atob(encoded)));
  return JSON.parse(json);
}

function getExportData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.endsWith('-storage')) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key) || '{}');
      } catch { /* skip unparseable */ }
    }
  }
  return data;
}

function importData(data: Record<string, unknown>) {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  });
  window.location.reload();
}

export default function QrSync() {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [qrData, setQrData] = useState('');
  const [qrSize, setQrSize] = useState(0);
  const [error, setError] = useState('');
  const [scannerStatus, setScannerStatus] = useState('');

  const scannerRef = useRef<any>(null);

  useEffect(() => {
    setError('');
    if (tab === 'export') {
      try {
        const data = getExportData();
        const encoded = encodeData(data);
        setQrSize(encoded.length);
        setQrData(encoded);
      } catch (e: any) {
        setError(`Failed to encode data: ${e.message}`);
      }
    }
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop().catch(() => {}); } catch {}
        scannerRef.current = null;
      }
    };
  }, [tab]);

  const startScanner = async () => {
    setError('');
    setScannerStatus('Requesting camera...');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          scanner.stop().catch(() => {});
          setScannerStatus('');
          setError('');
          try {
            const data = decodeData(decodedText);
            importData(data);
          } catch (e: any) {
            setError(`Invalid QR data: ${e.message}`);
            setScannerStatus('Scan failed. Try again.');
          }
        },
        () => { /* keep scanning */ }
      );
      setScannerStatus('Scanning... Point camera at the laptop QR code.');
    } catch (e: any) {
      setError(`Camera error: ${e.message}. Make sure to grant camera permission.`);
      setScannerStatus('');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <ArrowLeftRight size={24} className="text-intelligence" />
        <h1 className="text-2xl font-bold">QR Sync</h1>
      </div>

      <p className="text-sm text-gray-400">
        Sync your LifeOS data between laptop and phone.
        Export a QR code on your laptop, then scan it on your phone.
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('export')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'export' ? 'bg-intelligence/20 text-intelligence' : 'bg-surface text-gray-400 hover:text-gray-300'
          }`}
        >
          <Download size={16} /> Laptop — Export QR
        </button>
        <button
          onClick={() => { setTab('import'); startScanner(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'import' ? 'bg-intelligence/20 text-intelligence' : 'bg-surface text-gray-400 hover:text-gray-300'
          }`}
        >
          <Upload size={16} /> Mobile — Scan QR
        </button>
      </div>

      {tab === 'export' && (
        <div className="bg-card p-6 rounded-xl border border-border text-center space-y-4">
          <div className="flex items-center gap-2 justify-center text-green-400 text-sm">
            <Smartphone size={16} />
            <span>Open the QR Sync page on your phone and scan the code below</span>
          </div>

          {error && <p className="text-fitness text-sm">{error}</p>}

          {qrData && !error && (
            <>
              <div className="bg-white p-4 rounded-xl inline-block">
                <QRCodeCanvas value={qrData} size={280} level="M" />
              </div>
              <p className="text-xs text-gray-500">
                Data size: {(qrSize / 1024).toFixed(1)} KB
                {qrSize > 2000 && ' — Data too large for QR. Use Export Data in Settings instead.'}
              </p>
            </>
          )}

          <div className="border-t border-border pt-4 mt-4">
            <p className="text-xs text-gray-500">
              Alternatively, use Settings → Export Data and transfer the file manually.
            </p>
          </div>
        </div>
      )}

      {tab === 'import' && (
        <div className="bg-card p-6 rounded-xl border border-border text-center space-y-4">
          <div className="flex items-center gap-2 justify-center text-intelligence text-sm">
            <ScanLine size={16} />
            <span>Point your phone camera at the laptop's QR code</span>
          </div>

          <div id="qr-reader" className="mx-auto max-w-sm" />

          {scannerStatus && !error && (
            <p className="text-xs text-gray-400">{scannerStatus}</p>
          )}

          {error && <p className="text-fitness text-sm">{error}</p>}

          {!scannerRef.current && !scannerStatus && (
            <button onClick={startScanner} className="px-4 py-2 bg-intelligence/20 text-intelligence rounded-lg text-sm">
              Start Camera
            </button>
          )}

          <p className="text-xs text-gray-500">
            Grant camera permission when prompted. Data imports automatically on scan.
          </p>
        </div>
      )}
    </div>
  );
}