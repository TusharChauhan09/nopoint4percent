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
  try {
    const image = ctx.getImageData(0, 0, width, height);
    return (
      jsQR(image.data, width, height, { inversionAttempts: "attemptBoth" })
        ?.data ?? null
    );
  } catch {
    return null;
  }
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
    let stream: MediaStream | null = null;
    let timer = 0;
    let cancelled = false;
    let scanning = false;
    const detector = getBarcodeDetector();

    function schedule(delay: number) {
      window.clearTimeout(timer);
      if (!cancelled) {
        timer = window.setTimeout(() => {
          void scan();
        }, delay);
      }
    }

    async function start() {
      // Camera requires secure context; show helpful message otherwise.
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setCameraError("Camera needs HTTPS or localhost. Use a photo of the QR.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const liveVideo = videoRef.current;
        if (!liveVideo) return;
        liveVideo.srcObject = stream;
        try {
          await liveVideo.play();
        } catch {
          // Autoplay can reject; user can tap video to resume.
        }
        schedule(150);
      } catch {
        if (!cancelled) {
          setCameraError("Camera is blocked or missing. Use a photo of the QR.");
        }
      }
    }

    async function scan() {
      if (cancelled || scanning) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth) {
        schedule(250);
        return;
      }

      scanning = true;
      try {
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
            // Downscale full-HD frames so jsQR runs fast enough for auto-detect.
            const vw = video.videoWidth;
            const vh = video.videoHeight;
            const maxDim = 640;
            const scale = Math.min(1, maxDim / Math.max(vw, vh));
            const w = Math.max(1, Math.round(vw * scale));
            const h = Math.max(1, Math.round(vh * scale));
            if (canvas.width !== w) canvas.width = w;
            if (canvas.height !== h) canvas.height = h;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, w, h);
              payload = readFromCanvas(canvas);
            }
          }
        }

        if (payload && payload !== lastRejected.current) {
          if (onDetectRef.current(payload)) return;
          lastRejected.current = payload;
          setHint("That QR is not a UPI payment code.");
        }
      } finally {
        scanning = false;
      }

      schedule(120);
    }

    void start();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
      const v = videoRef.current;
      if (v) {
        try {
          v.pause();
        } catch {
          // ignore
        }
        v.srcObject = null;
      }
    };
  }, []);

  function readFile(file: File) {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas || !image.naturalWidth || !image.naturalHeight) {
          setHint("Could not open that photo.");
          return;
        }
        // Downscale huge photos so jsQR can detect reliably.
        const maxDim = 1280;
        const scale = Math.min(
          1,
          maxDim / Math.max(image.naturalWidth, image.naturalHeight),
        );
        const w = Math.max(1, Math.round(image.naturalWidth * scale));
        const h = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setHint("Could not open that photo.");
          return;
        }
        ctx.drawImage(image, 0, 0, w, h);
        const payload = readFromCanvas(canvas);
        if (payload && onDetectRef.current(payload)) return;
        setHint(
          payload
            ? "That QR is not a UPI payment code."
            : "No UPI QR in that photo. Try a sharper shot.",
        );
      } finally {
        URL.revokeObjectURL(url);
      }
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
          autoPlay
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
