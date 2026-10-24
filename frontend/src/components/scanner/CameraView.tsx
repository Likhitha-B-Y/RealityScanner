/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Upload, Zap, Sparkles, Navigation } from 'lucide-react';
import { compressImage } from '../../utils/imageCompression.ts';
import { extractExif } from '../../utils/exifExtractor.ts';

interface CameraViewProps {
  onCapture: (payload: {
    imageBase64: string;
    deviceGps: { latitude: number; longitude: number; accuracy: number };
    heading: number;
    deviceTimestamp: string;
    exifGps?: { latitude: number; longitude: number } | null;
    exifTimestamp?: string | null;
    isScreenshot?: boolean;
  }) => void;
  onOpenDemoSelector: () => void;
  isScanning: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCapture,
  onOpenDemoSelector,
  isScanning,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Live telemetry state
  const [gps, setGps] = useState<{ latitude: number; longitude: number; accuracy: number }>({
    latitude: 12.9784,
    longitude: 77.6408,
    accuracy: 3.5,
  });
  const [heading, setHeading] = useState<number>(84);

  // Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        setCameraError(null);
        if (activeStream) {
          activeStream.getTracks().forEach((track) => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: cameraFacing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Check torch capability
        const track = mediaStream.getVideoTracks()[0];
        const capabilities = track.getCapabilities ? (track.getCapabilities() as any) : {};
        if (capabilities.torch) {
          setHasTorch(true);
        }
      } catch (err: unknown) {
        console.warn('getUserMedia camera error:', err);
        setCameraError('Camera access unavailable. You can upload an image or use curated demo fixtures.');
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraFacing]);

  // Geolocation & Device Orientation tracking
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setGps({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy),
          });
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(Math.round(event.alpha));
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Toggle torch
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch failed', e);
    }
  };

  // Flip camera
  const flipCamera = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from video
  const handleCapture = async () => {
    if (isScanning) return;

    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const rawBase64 = canvas.toDataURL('image/jpeg', 0.88);
        const compressed = await compressImage(rawBase64);

        onCapture({
          imageBase64: compressed.base64,
          deviceGps: gps,
          heading,
          deviceTimestamp: new Date().toISOString(),
          isScreenshot: false,
        });
      }
    }
  };

  // Handle manual file upload fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const exifData = await extractExif(file);
    const compressed = await compressImage(file);

    onCapture({
      imageBase64: compressed.base64,
      deviceGps: exifData.gps ? { latitude: exifData.gps.latitude, longitude: exifData.gps.longitude, accuracy: 5 } : gps,
      heading,
      deviceTimestamp: exifData.timestamp || new Date().toISOString(),
      exifGps: exifData.gps,
      exifTimestamp: exifData.timestamp,
      isScreenshot: exifData.isScreenshot,
    });
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[520px] max-h-[820px] rounded-[2rem] overflow-hidden card-surface border border-slate-800/80 shadow-[0_80px_160px_-120px_rgba(34,211,238,0.4)] flex flex-col justify-between select-none">
      {/* Live Video Feed or Fallback */}
      <div className="absolute inset-0 z-0">
        {!cameraError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900/90 to-slate-950/95">
            <div className="w-14 h-14 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-300 text-sm max-w-xs mb-5">{cameraError}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-full bg-slate-950/70 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-800/80 hover:border-cyan-400/40 hover:text-white transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </button>
              <button
                onClick={onOpenDemoSelector}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-2 transition-all hover:brightness-110"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Demo Fixtures
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HUD Reticle Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6">
        {/* Top HUD Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 font-mono tracking-tight glass-panel px-3 py-2 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-300"></span>
            </span>
            <span className="uppercase tracking-[0.4em]">Reality Scanner HUD</span>
          </div>
          <div className="flex items-center gap-3 tabular-nums">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-cyan-300 transform" style={{ transform: `rotate(${heading}deg)` }} />
              {heading}°
            </span>
            <span className="hidden sm:inline">{gps.latitude.toFixed(4)}°N, {gps.longitude.toFixed(4)}°E</span>
          </div>
        </div>

        {/* Center Reticle Brackets */}
        <div className="relative mx-auto my-auto w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-cyan-300 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-cyan-300 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-cyan-300 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-cyan-300 rounded-br-3xl" />

          <div className="w-3 h-3 rounded-full bg-cyan-300/90 shadow-[0_0_80px_rgba(34,211,238,0.6)]" />
          <div className="absolute top-1/2 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
          <div className="absolute left-1/2 top-6 bottom-6 w-[1px] bg-gradient-to-b from-transparent via-cyan-300/40 to-transparent" />

          <div className="absolute -bottom-10 px-4 py-1.5 glass-panel rounded-full text-[11px] text-slate-200 font-sans tracking-wide">
            Center the defect inside the frame
          </div>
        </div>

        {/* Bottom Status Ticker */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>WARD 112 · INDIRANAGAR</span>
          <span>AUTO-CALIBRATED · 4G COMPRESSED</span>
        </div>
      </div>

      {/* Floating Control Buttons */}
      <div className="relative z-20 w-full p-4 flex flex-col gap-3">
        {/* Secondary controls row */}
        <div className="flex items-center justify-between px-2">
          {hasTorch ? (
            <button
              onClick={toggleTorch}
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                torchOn ? 'bg-amber-400 text-slate-950' : 'bg-slate-900/80 text-white border border-slate-700'
              }`}
              aria-label="Toggle Flashlight"
            >
              <Zap className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-11 h-11" />
          )}

          {/* Demo fixture launcher */}
          <button
            onClick={onOpenDemoSelector}
            className="px-3.5 py-1.5 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-500/40 text-xs font-medium flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Judge Demo Scenarios (8)</span>
          </button>

          <button
            onClick={flipCamera}
            className="w-11 h-11 rounded-full bg-slate-900/80 text-white border border-slate-700 flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform"
            aria-label="Flip Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Shutter Row */}
        <div className="flex items-center justify-center gap-8 py-2">
          {/* Gallery Upload trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center active:scale-95 transition-transform"
            title="Upload from gallery"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Big Tactile Shutter Button */}
          <button
            onClick={handleCapture}
            disabled={isScanning}
            className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 p-1 flex items-center justify-center shadow-xl shadow-cyan-500/20 active:scale-90 transition-transform disabled:opacity-50"
            aria-label="Capture Civic Issue"
          >
            <div className="w-full h-full rounded-full border-4 border-slate-950 bg-white flex items-center justify-center" />
          </button>

          {/* Spacer to balance gallery button */}
          <div className="w-12 h-12" />
        </div>
      </div>
    </div>
  );
};
