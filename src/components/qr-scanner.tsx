"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export function QRScanner({ open, onClose, onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!open) {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error("Error clearing scanner:", error);
        }
        scannerRef.current = null;
      }
      setIsScanning(false);
      return;
    }

    const initializeScanner = () => {
      const elementId = "qr-reader";
      const element = document.getElementById(elementId);

      if (!element) {
        setTimeout(initializeScanner, 100);
        return;
      }

      element.innerHTML = "";

      const html5QrcodeScanner = new Html5QrcodeScanner(
        elementId,
        {
          qrbox: {
            width: 300,
            height: 300,
          },
          fps: 10,
          aspectRatio: 1.0,
          supportedScanTypes: [0],
          videoConstraints: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          html5QrcodeScanner.clear();
          scannerRef.current = null;
          setIsScanning(false);
          onClose();
        },
        (errorMessage) => {}
      );

      scannerRef.current = html5QrcodeScanner;
      setIsScanning(true);
    };

    const timeoutId = setTimeout(initializeScanner, 100);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error("Error clearing scanner on cleanup:", error);
        }
        scannerRef.current = null;
      }
    };
  }, [open, onClose, onScanSuccess]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quét mã QR</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div id="qr-reader" className="w-full"></div>
          {isScanning && (
            <p className="text-sm text-muted-foreground text-center">
              Đưa camera vào mã QR để quét
            </p>
          )}
          <Button variant="outline" onClick={onClose} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
