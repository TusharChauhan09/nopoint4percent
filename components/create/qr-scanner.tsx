"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";

type QrScannerProps = {
  onDetect: (payload: string) => boolean;
  onClose: () => void;
};

type Detector = {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
};

function getBarcodeDetector(): Detector | null {
  const Ctor = (
    window as Window & {
      BarcodeDetector?: new (opts: { formats: string[] }) => Detector;
    }
  ).BarcodeDetector;
  if (!Ctor) return null;
  try {
    return new Ctor({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}

function readFromCanvas(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const { width, height } = canvas;
  if (!width || !height) return null;
  const image = ctx.getImageData(0, 0, width, height);
  return jsQR(image.data, width, height)?.data ?? null;
}

export function QrScanner({ onDetect, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const onDetectRef = useRef(onDetect);
  const lastRejected = useRef("");
  const [cameraError, setCameraError] = useState("");
  const [hint, setHint] = useState("Hold a UPI QR inside the frame");
  onDetectRef.current = onDetect;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    const detector = getBarcodeDetector();

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        scan();
      } catch {
        if (!cancelled) {
          setCameraError("Camera is blocked or missing. Use a photo of the QR.");
        }
      }
    }

    async function scan() {
      if (cancelled || !video || video.readyState < 2) {
        raf = window.requestAnimationFrame(() => {
          void scan();
        });
        return;
      }

      let payload: string | null = null;
      if (detector) {
        try {
          const codes = await detector.detect(video);
          payload = codes.find((code) => code.rawValue)?.rawValue ?? null;
        } catch {
          payload = null;
        }
      }

      if (!payload) {
        const canvas = canvasRef.current;
        if (canvas) {
          const width = video.videoWidth;
          const height = video.videoHeight;
          if (width && height) {
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx?.drawImage(video, 0, 0, width, height);
            payload = readFromCanvas(canvas);
          }
        }
      }

      if (payload && payload !== lastRejected.current) {
        if (onDetectRef.current(payload)) return;
        lastRejected.current = payload;
        setHint("That QR is not a UPI payment code.");
      }

      raf = window.requestAnimationFrame(() => {
        void scan();
      });
    }

    void start();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function readFile(file: File) {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx?.drawImage(image, 0, 0);
      const payload = readFromCanvas(canvas);
      URL.revokeObjectURL(url);
      if (payload && onDetectRef.current(payload)) return;
      setHint(
        payload
          ? "That QR is not a UPI payment code."
          : "No UPI QR in that photo. Try a sharper shot.",
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setHint("Could not open that photo.");
    };
    image.src = url;
  }

  return (
    <div className="max-w-xl">
      <div className="relative overflow-hidden bg-ink">
        <video
          ref={videoRef}
          className="aspect-4/5 w-full object-cover sm:aspect-5/4"
          playsInline
          muted
        />
        <div className="pointer-events-none absolute inset-0">
          <span className="absolute top-8 left-8 size-10 border-t-2 border-l-2 border-slip" />
          <span className="absolute top-8 right-8 size-10 border-t-2 border-r-2 border-slip" />
          <span className="absolute bottom-8 left-8 size-10 border-b-2 border-l-2 border-slip" />
          <span className="absolute bottom-8 right-8 size-10 border-b-2 border-r-2 border-slip" />
        </div>
        <p className="absolute inset-x-0 bottom-0 bg-ink/70 px-4 py-3 text-sm text-slip">
          {cameraError || hint}
        </p>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
          e.target.value = "";
        }}
      />
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="button"
          className="h-12 rounded-sm px-6 text-base"
          onClick={() => fileRef.current?.click()}
        >
          Use a photo
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-12 rounded-sm px-4 text-base"
          onClick={onClose}
        >
          Type the UPI ID instead
        </Button>
      </div>
    </div>
  );
}
