import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Create scanner instance
    scannerRef.current = new Html5Qrcode("qr-reader");

    // Start scanning
    if (scannerRef.current) {
      scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText) => {
          if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
              setIsScanning(false);
              onScanSuccess(decodedText);
            });
          }
        },
        (error) => {
          if (onScanError) {
            onScanError(error);
          }
        }
      ).catch((err) => {
        console.error("Failed to start scanner:", err);
      });

      setIsScanning(true);
    }

    // Cleanup
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1E1E1E] rounded-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        
        <h2 className="text-xl font-semibold mb-4 text-white">Scan QR Code</h2>
        
        <div className="aspect-square bg-black rounded-lg overflow-hidden mb-4">
          <div id="qr-reader" className="w-full h-full"></div>
        </div>
        
        <p className="text-center text-gray-400 text-sm">
          Position the QR code within the frame to scan
        </p>
      </div>
      
      <style>{`
        #qr-reader {
          border: none !important;
          width: 100% !important;
          height: 100% !important;
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 8px !important;
        }
        #qr-reader__status_span {
          background: #1E1E1E !important;
          color: #9CA3AF !important;
          border: none !important;
        }
        #qr-reader__dashboard {
          background: #1E1E1E !important;
          border: none !important;
          padding: 0 !important;
        }
        #qr-reader__dashboard button {
          background: #059669 !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 6px !important;
          cursor: pointer !important;
        }
        #qr-reader__dashboard button:hover {
          background: #047857 !important;
        }
        #qr-reader__camera_selection {
          background: #282828 !important;
          color: white !important;
          border: 1px solid #374151 !important;
          padding: 8px !important;
          border-radius: 6px !important;
          margin-right: 10px !important;
        }
        #qr-reader__camera_permission_button {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default QRScanner; 