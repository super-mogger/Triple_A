import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { XCircle } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onScanError: (error: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanError, onClose }) => {
  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: 250
    };

    const scanner = new Html5QrcodeScanner('reader', config, false);

    scanner.render(
      (decodedText: string) => {
        try {
          scanner.clear();
          onScanSuccess(decodedText);
        } catch (error) {
          console.error('Error clearing scanner:', error);
        }
      },
      (errorMessage: string) => {
        if (!errorMessage.includes('No MultiFormat Readers')) {
          onScanError(errorMessage);
        }
      }
    );

    return () => {
      try {
        scanner.clear();
      } catch (error) {
        console.error('Error clearing scanner:', error);
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XCircle className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Scan QR Code</h2>
        <div className="relative">
          <div id="reader" className="w-full overflow-hidden rounded-lg"></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
          Position the QR code within the frame to scan
        </p>

        <style>{`
          #reader {
            border: none !important;
            width: 100% !important;
          }
          #reader__scan_region {
            background: transparent !important;
          }
          #reader__scan_region video {
            max-height: 300px !important;
            object-fit: cover !important;
            border-radius: 0.5rem !important;
          }
          #reader__dashboard {
            padding: 0 !important;
            margin-top: 1rem !important;
          }
          #reader__dashboard_section {
            padding: 0 !important;
          }
          #reader__dashboard_section_swaplink {
            color: #10B981 !important;
          }
          #reader__status_span {
            background: transparent !important;
            color: #6B7280 !important;
            border: none !important;
            font-size: 0.875rem !important;
          }
          select {
            background: #1E1E1E !important;
            color: white !important;
            border: 1px solid #374151 !important;
            padding: 0.5rem !important;
            border-radius: 0.5rem !important;
            margin-bottom: 1rem !important;
          }
          #reader__camera_selection {
            width: 100% !important;
            max-width: 400px !important;
          }
          #reader__filescan_input {
            width: 100% !important;
            max-width: 400px !important;
            color: #6B7280 !important;
          }
          button {
            background: #10B981 !important;
            color: white !important;
            border: none !important;
            padding: 0.5rem 1rem !important;
            border-radius: 0.5rem !important;
            cursor: pointer !important;
          }
          button:hover {
            background: #059669 !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default QRScanner; 