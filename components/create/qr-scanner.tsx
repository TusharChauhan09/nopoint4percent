"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";

type QrScannerProps = {
  onDetect: (payload: string) => boolean;
  onClose: () => void;
};

type Detector = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
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

function decodeImageData(image: ImageData): string | null {
  try {
    return (
      jsQR(image.data, image.width, image.height, {
        inversionAttempts: "attemptBoth",
      })?.data ?? null
    );
  } catch {
    return null;
  }
}

function drawAndDecode(
  source: CanvasImageSource,
  sw: number,
  sh: number,
  canvas: HTMLCanvasElement,
  maxDim: number,
): string | null {
  const scale = Math.min(1, maxDim / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, w, h);
  return decodeImageData(ctx.getImageData(0, 0, w, h));
}

function decodeSource(
  source: CanvasImageSource,
  sw: number,
  sh: number,
  canvas: HTMLCanvasElement,
): string | null {
  for (const maxDim of [sw > 1600 ? 1600 : sw, 1000, 720, 480]) {
    const payload = drawAndDecode(source, sw, sh, canvas, maxDim);
    if (payload) return payload;
  }

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const crop = 0.62;
  const cw = Math.max(1, Math.round(sw * crop));
  const ch = Math.max(1, Math.round(sh * crop));
  const sx = Math.round((sw - cw) / 2);
  const sy = Math.round((sh - ch) / 2);
  const out = 720;
  const scale = Math.min(1, out / Math.max(cw, ch));
  const w = Math.max(1, Math.round(cw * scale));
  const h = Math.max(1, Math.round(ch * scale));
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(source, sx, sy, cw, ch, 0, 0, w, h);
  return decodeImageData(ctx.getImageData(0, 0, w, h));
}

export function QrScanner({ onDetect, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const onDetectRef = useRef(onDetect);
  const lastRejected = useRef("");
  const [cameraError, setCameraError] = useState("");
  const [hint, setHint] = useState("Hold a UPI QR inside the frame");
  const [busy, setBusy] = useState(false);
  onDetectRef.current = onDetect;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    let scanning = false;
    const detector = getBarcodeDetector();

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera needs HTTPS. Choose a photo from gallery.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play().catch(() => {});
        loop();
      } catch {
        if (!cancelled) {
          setCameraError("Camera is blocked. Choose a photo from gallery.");
        }
      }
    }

    async function loop() {
      if (cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (
        !scanning &&
        video &&
        canvas &&
        video.readyState >= 2 &&
        video.videoWidth
      ) {
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
            payload = drawAndDecode(
              video,
              video.videoWidth,
              video.videoHeight,
              canvas,
              800,
            );
          }
          if (payload && payload !== lastRejected.current) {
            if (onDetectRef.current(payload)) return;
            lastRejected.current = payload;
            setHint("That QR is not a UPI payment code.");
          }
        } finally {
          scanning = false;
        }
      }
      raf = window.requestAnimationFrame(() => {
        void loop();
      });
    }

    void start();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, []);

  async function readFile(file: File) {
    setBusy(true);
    setHint("Reading QR…");
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setHint("Could not open that photo.");
        return;
      }

      let bitmap: ImageBitmap | null = null;
      try {
        bitmap = await createImageBitmap(file, {
          imageOrientation: "from-image",
        } as ImageBitmapOptions);
      } catch {
        bitmap = await createImageBitmap(file);
      }

      let payload =
        (getBarcodeDetector()
          ? (await getBarcodeDetector()!
              .detect(bitmap)
              .catch(() => []))
              .find((code) => code.rawValue)?.rawValue
          : null) ?? null;

      if (!payload) {
        payload = decodeSource(bitmap, bitmap.width, bitmap.height, canvas);
      }
      bitmap.close();

      if (payload && onDetectRef.current(payload)) return;
      setHint(
        payload
          ? "That QR is not a UPI payment code."
          : "No UPI QR in that photo. Try a closer shot.",
      );
    } catch {
      setHint("Could not open that photo.");
    } finally {
      setBusy(false);
    }
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
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed top-0 left-0 size-px opacity-0"
        aria-hidden
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void readFile(file);
          e.target.value = "";
        }}
      />
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="button"
          className="h-12 rounded-sm px-6 text-base"
          disabled={busy}
          onClick={() => galleryRef.current?.click()}
        >
          Choose from gallery
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
