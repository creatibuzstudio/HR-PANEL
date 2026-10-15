import React, { useState, useRef, useEffect, useCallback } from "react";
import Modal from "@/components/ui/modal";
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Video, UserCheck, Upload } from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";

export default function WebcamCaptureModal({
  isOpen,
  onClose,
  type = "CLOCK_IN", // "CLOCK_IN" | "CLOCK_OUT"
  userName = "User",
  onSubmit,
  isSubmitting = false,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraState, setCameraState] = useState("INITIALIZING"); // "INITIALIZING" | "READY" | "CAPTURED" | "ERROR"
  const [errorMessage, setErrorMessage] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [note, setNote] = useState("");
  const [countdown, setCountdown] = useState(null);

  // Stop video stream cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start webcam stream
  const startCamera = useCallback(async () => {
    stopStream();
    setCameraState("INITIALIZING");
    setErrorMessage("");
    setCapturedPhoto(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access is not supported by your browser environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraState("READY");
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      let msg = "Could not activate camera. Please ensure camera permissions are allowed.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera permission was denied. Please allow camera permissions in your browser bar.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No webcam device was found on this system.";
      }
      setErrorMessage(msg);
      setCameraState("ERROR");
    }
  }, [stopStream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setNote("");
    } else {
      stopStream();
      setCapturedPhoto(null);
      setCountdown(null);
    }
    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Capture frame from video onto canvas with timestamp watermark
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    // Draw mirrored image for natural selfie feel
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    // Watermark overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, height - 44, width, 44);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`${userName} • ${type === "CLOCK_IN" ? "CLOCK-IN" : "CLOCK-OUT"} VERIFIED`, 14, height - 25);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "11px monospace";
    ctx.fillText(`${moment().format("YYYY-MM-DD HH:mm:ss")} • Creatibuz Studio`, 14, height - 10);

    // Convert to lightweight crisp JPEG base64 string
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    setCapturedPhoto(dataUrl);
    setCameraState("CAPTURED");
  };

  // Trigger 3s countdown snap
  const startCountdownAndSnap = () => {
    if (countdown !== null) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          captureFrame();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 900);
  };

  // Fallback file upload if webcam blocked
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedPhoto(reader.result);
      setCameraState("CAPTURED");
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmSubmit = () => {
    if (!capturedPhoto) {
      toast.error("Please capture your verification photo first.");
      return;
    }
    onSubmit({ photo: capturedPhoto, note });
  };

  const isClockIn = type === "CLOCK_IN";

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopStream();
        onClose();
      }}
      title=""
      size="lg"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
                isClockIn
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
              }`}
            >
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                {isClockIn ? "Clock In Verification" : "Clock Out & Shift Summary"}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isClockIn
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                  }`}
                >
                  {isClockIn ? "Shift Start" : "Shift End"}
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                {isClockIn
                  ? "Snap a live webcam photo to start your 6-hour daily work session."
                  : "Snap a live webcam photo to verify shift completion."}
              </p>
            </div>
          </div>
        </div>

        {/* Camera Viewport / Captured Preview */}
        <div className="relative aspect-video w-full rounded-2xl bg-gray-950 overflow-hidden flex items-center justify-center border-2 border-gray-800 shadow-inner group">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              cameraState === "CAPTURED" ? "hidden" : "block"
            }`}
          />

          {/* Hidden Canvas for Frame Extraction */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Captured Preview */}
          {cameraState === "CAPTURED" && capturedPhoto && (
            <div className="relative w-full h-full">
              <img
                src={capturedPhoto}
                alt="Captured Snapshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Snapshot Verified
              </div>
            </div>
          )}

          {/* Initializing Spinner */}
          {cameraState === "INITIALIZING" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 text-white space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs font-semibold text-gray-300">
                Connecting to webcam device...
              </span>
            </div>
          )}

          {/* Countdown Animation */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <span className="text-7xl font-extrabold text-white animate-ping">
                {countdown}
              </span>
            </div>
          )}

          {/* Live Status Overlay in Video Mode */}
          {cameraState === "READY" && countdown === null && (
            <>
              {/* Face Guide Oval */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-56 rounded-full border-2 border-dashed border-white/50 shadow-2xl relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white/80 uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-full">
                    Face Frame
                  </div>
                </div>
              </div>

              {/* Top Live Bar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-[11px] pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE CAMERA
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs font-mono">
                  {moment().format("hh:mm:ss A")}
                </span>
              </div>
            </>
          )}

          {/* Error / Permission Denied State */}
          {cameraState === "ERROR" && (
            <div className="p-6 text-center space-y-3 max-w-sm text-white">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-rose-300">Webcam Inaccessible</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{errorMessage}</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                >
                  Retry Camera
                </button>
                <label className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Note / Task Description Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {isClockIn
              ? "Shift Objective / Tasks for Today (Optional)"
              : "Work Summary & Accomplishments (Optional)"}
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isClockIn
                ? "e.g. Starting development on Dashboard components & API integrations"
                : "e.g. Completed 6 hours quota. Implemented attendance tracker & reviewed pull requests."
            }
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {cameraState === "CAPTURED" ? (
              <>
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Retake Photo
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                    isClockIn
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                      : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Logging Session...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {isClockIn ? "Confirm & Start Clock In" : "Confirm & Clock Out"}
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startCountdownAndSnap}
                disabled={cameraState !== "READY" || countdown !== null}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                Capture Photo
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
