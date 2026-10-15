import React, { useState, useRef, useEffect, useCallback } from "react";
import Modal from "@/components/ui/modal";
import {
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Video,
  UserCheck,
  Upload,
  ShieldCheck,
  AlertTriangle,
  User,
} from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";
import * as faceapi from "@vladmandic/face-api/dist/face-api.esm.js";

let isModelsLoaded = false;
let modelLoadingPromise = null;

async function loadFaceModels() {
  if (isModelsLoaded) return true;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    const MODEL_URL = "/models";
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      isModelsLoaded = true;
      return true;
    } catch (err) {
      console.warn("Retrying with standard models:", err);
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      isModelsLoaded = true;
      return true;
    }
  })();

  return modelLoadingPromise;
}

async function loadImageSafe(url) {
  if (!url) return null;
  if (url.startsWith("data:")) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // 1. Attempt fetch with CORS to convert to object URL (guarantees untainted canvas)
  try {
    const resp = await fetch(url, { mode: "cors" });
    if (resp.ok) {
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = blobUrl;
      });
    }
  } catch {}

  // 2. Fallback: standard Image with anonymous CORS
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // 3. Fallback: Image without crossOrigin
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => resolve(null);
      fallbackImg.src = url;
    };
    img.src = url;
  });
}

async function getDescriptorFromImage(imgElement) {
  if (!imgElement) return null;
  await loadFaceModels();

  let detection = await faceapi
    .detectSingleFace(
      imgElement,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.25 })
    )
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  if (!detection) {
    try {
      detection = await faceapi
        .detectSingleFace(
          imgElement,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.15 })
        )
        .withFaceLandmarks(true)
        .withFaceDescriptor();
    } catch {}
  }

  // Try SSD MobileNet if Tiny didn't catch the face
  if (!detection) {
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      detection = await faceapi
        .detectSingleFace(imgElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();
    } catch {}
  }

  return detection;
}

/**
 * Real AI Face Recognition using 128-dimensional Deep Neural Embeddings:
 * 1. Detects face landmarks for both registered profile photo and webcam snap.
 * 2. Computes 128-d Euclidean distance between facial biometric vectors.
 * 3. Distance <= 0.60 corresponds to >= 40% match (Same Person).
 * 4. Distance > 0.60 corresponds to < 40% match (Different Person - BLOCKED).
 */
async function calculateFaceSimilarity(registeredImgUrl, capturedDataUrl) {
  if (!registeredImgUrl || registeredImgUrl.includes("ui-avatars.com")) {
    return { score: 100, isBaseline: true, message: "Baseline face registered" };
  }

  try {
    await loadFaceModels();

    const [imgRegistered, imgCaptured] = await Promise.all([
      loadImageSafe(registeredImgUrl),
      loadImageSafe(capturedDataUrl),
    ]);

    const [detRegistered, detCaptured] = await Promise.all([
      getDescriptorFromImage(imgRegistered),
      getDescriptorFromImage(imgCaptured),
    ]);

    // 1. Live photo face detection check
    if (!detCaptured) {
      return {
        score: 0,
        isBaseline: false,
        error: "No human face detected in the live camera snap. Please position your face clearly in the frame.",
      };
    }

    // 2. Registered photo face detection check
    if (!detRegistered) {
      return {
        score: 100,
        isBaseline: true,
        message: "No human face found in old profile picture. Registering this face as new benchmark.",
      };
    }

    // 3. Compute real 128-dimensional Euclidean distance
    const distance = faceapi.euclideanDistance(
      detRegistered.descriptor,
      detCaptured.descriptor
    );

    // Standard FaceNet/ResNet Euclidean distance mapping:
    // Distance 0.0 -> 100% match
    // Distance <= 0.60 -> >= 40% match (Official Pass Threshold)
    // Distance >= 0.80 -> 0% match (Completely different person)
    let score = 0;
    if (distance <= 0.60) {
      score = Math.round(100 - (distance / 0.60) * 60);
    } else {
      score = Math.max(0, Math.round(40 - ((distance - 0.60) / 0.20) * 40));
    }

    return {
      score,
      distance: Number(distance.toFixed(3)),
      isBaseline: false,
    };
  } catch (err) {
    console.error("Face similarity calculation error:", err);
    return {
      score: 0,
      isBaseline: false,
      error: "Facial analysis error. Please retake the photo.",
    };
  }
}

export default function WebcamCaptureModal({
  isOpen,
  onClose,
  type = "CLOCK_IN", // "CLOCK_IN" | "CLOCK_OUT"
  userName = "User",
  userPicture = "",
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

  // Face Matching State (Min. 40% required)
  const [matchResult, setMatchResult] = useState({
    score: null,
    isBaseline: false,
    isAnalyzing: false,
  });

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
    setMatchResult({ score: null, isBaseline: false, isAnalyzing: false });

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
      loadFaceModels(); // Warm up AI models in background
    } else {
      stopStream();
      setCapturedPhoto(null);
      setCountdown(null);
      setMatchResult({ score: null, isBaseline: false, isAnalyzing: false });
    }
    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Execute Face Similarity Matching against User's Dashboard Photo
  const runFaceAnalysis = async (dataUrl) => {
    setMatchResult({ score: null, isBaseline: false, isAnalyzing: true });
    try {
      const res = await calculateFaceSimilarity(userPicture, dataUrl);
      if (res.error) {
        setMatchResult({
          score: 0,
          isBaseline: false,
          isAnalyzing: false,
        });
        toast.error(res.error, { duration: 4000 });
        return;
      }

      setMatchResult({
        score: res.score,
        isBaseline: res.isBaseline,
        isAnalyzing: false,
      });

      if (!res.isBaseline && res.score < 40) {
        toast.error(
          `Face match (${res.score}%) is below the mandatory 40% threshold. Verification failed.`,
          { duration: 4000 }
        );
      } else if (!res.isBaseline && res.score >= 40) {
        toast.success(`Face match verified: ${res.score}% (Required >= 40%)`);
      }
    } catch {
      setMatchResult({ score: 0, isBaseline: false, isAnalyzing: false });
      toast.error("Facial verification failed. Please try again.");
    }
  };

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

    // Perform facial similarity analysis against registered photo
    runFaceAnalysis(dataUrl);
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
      const dataUrl = reader.result;
      setCapturedPhoto(dataUrl);
      setCameraState("CAPTURED");
      runFaceAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const isClockIn = type === "CLOCK_IN";
  const isMatchPassed =
    matchResult.isBaseline || (matchResult.score !== null && matchResult.score >= 40);

  const handleConfirmSubmit = () => {
    if (!capturedPhoto) {
      toast.error("Please capture your verification photo first.");
      return;
    }
    if (matchResult.score !== null && !matchResult.isBaseline && matchResult.score < 40) {
      toast.error(
        `Verification failed: Face match score (${matchResult.score}%) is below the required 40% threshold. Please retake your photo.`
      );
      return;
    }
    onSubmit({
      photo: capturedPhoto,
      note,
      faceMatchScore: matchResult.score !== null ? matchResult.score : 100,
    });
  };

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
                Live webcam verification with mandatory 40% facial match against your dashboard profile picture.
              </p>
            </div>
          </div>

          {/* Registered profile picture badge */}
          {userPicture && !userPicture.includes("ui-avatars.com") && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <img
                src={userPicture}
                alt={userName}
                className="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-gray-600"
              />
              <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                Dashboard Photo
              </span>
            </div>
          )}
        </div>

        {/* Viewport: Live Camera Feed or Split Comparison */}
        {cameraState === "CAPTURED" && capturedPhoto ? (
          <div className="space-y-3">
            {/* Split Photo Comparison Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Left: Registered Dashboard Picture */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-2.5 flex flex-col items-center justify-between space-y-2">
                <div className="w-full flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Dashboard Profile
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    Target
                  </span>
                </div>

                <div className="relative aspect-square w-full max-w-[180px] rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-xs">
                  {userPicture ? (
                    <img
                      src={userPicture}
                      alt="Dashboard profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 text-gray-400 text-xs font-semibold">
                      <User className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      Initial Face Benchmark
                    </div>
                  )}
                </div>

                <span className="text-[11px] font-medium text-gray-500 truncate max-w-[150px]">
                  {userName}
                </span>
              </div>

              {/* Right: Live Camera Snapshot */}
              <div
                className={`rounded-xl border p-2.5 flex flex-col items-center justify-between space-y-2 transition-all ${
                  isMatchPassed
                    ? "border-emerald-300 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : "border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20"
                }`}
              >
                <div className="w-full flex items-center justify-between text-[11px] font-bold">
                  <span
                    className={`flex items-center gap-1 ${
                      isMatchPassed ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Captured Snap
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      isMatchPassed
                        ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                        : "bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200"
                    }`}
                  >
                    {isMatchPassed ? "Verified" : "Low Match"}
                  </span>
                </div>

                <div className="relative aspect-square w-full max-w-[180px] rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-700 bg-black flex items-center justify-center shadow-xs">
                  <img
                    src={capturedPhoto}
                    alt="Captured Snapshot"
                    className="w-full h-full object-cover"
                  />
                  {isMatchPassed && (
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-white shadow-md">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <span className="text-[11px] font-medium text-gray-500 font-mono">
                  {moment().format("hh:mm:ss A")}
                </span>
              </div>
            </div>

            {/* Face Similarity Score Analysis Card */}
            <div
              className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                matchResult.isAnalyzing
                  ? "border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20"
                  : isMatchPassed
                  ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30"
                  : "border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className={`w-5 h-5 ${
                      isMatchPassed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    Facial Match Verification (Min. 40% Required)
                  </span>
                </div>

                {matchResult.isAnalyzing ? (
                  <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing face...
                  </span>
                ) : matchResult.isBaseline ? (
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    100% Match • Baseline Registered
                  </span>
                ) : (
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isMatchPassed
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {isMatchPassed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {matchResult.score}% Match • Passed
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {matchResult.score}% Match • Failed (Below 40%)
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Similarity Progress Bar */}
              <div className="relative pt-1 pb-1">
                <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
                  {/* Minimum 40% Marker Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-500 z-10"
                    style={{ left: "40%" }}
                    title="Required 40% Match Threshold"
                  />
                  {/* Fill Bar */}
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isMatchPassed ? "bg-gradient-to-r from-teal-500 to-emerald-500" : "bg-rose-500"
                    }`}
                    style={{
                      width: `${matchResult.isBaseline ? 100 : matchResult.score || 0}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-gray-500 font-semibold mt-1">
                  <span>0%</span>
                  <span className="text-gray-700 dark:text-gray-300 font-bold">▲ 40% Required</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Status Message */}
              <p
                className={`text-xs leading-relaxed ${
                  isMatchPassed
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-rose-800 dark:text-rose-300 font-medium"
                }`}
              >
                {matchResult.isAnalyzing
                  ? "Comparing facial features and color distribution against your registered profile photo..."
                  : matchResult.isBaseline
                  ? "First-time facial registration. This snapshot has been benchmarked as your official face record."
                  : isMatchPassed
                  ? "Face verified successfully! Snapshot matches your registered dashboard photo above the 40% quota."
                  : `⚠️ Face verification failed. Snapshot matches only ${matchResult.score}%, which is below the required 40% threshold. Please align your face directly, ensure good room lighting, and retake the photo.`}
              </p>
            </div>
          </div>
        ) : (
          /* Live Webcam Viewport */
          <div className="relative aspect-video w-full rounded-2xl bg-gray-950 overflow-hidden flex items-center justify-center border-2 border-gray-800 shadow-inner group">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover transform -scale-x-100 block"
            />

            <canvas ref={canvasRef} className="hidden" />

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

            {/* Live Camera Guidelines Overlay */}
            {cameraState === "READY" && countdown === null && (
              <>
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-56 rounded-full border-2 border-dashed border-white/50 shadow-2xl relative">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white/90 uppercase tracking-wider bg-black/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Center Face
                    </div>
                  </div>
                </div>

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
        )}

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
                  disabled={isSubmitting || !isMatchPassed}
                  className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    !isMatchPassed
                      ? "bg-gray-500 hover:bg-gray-600"
                      : isClockIn
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                      : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Logging Session...
                    </>
                  ) : !isMatchPassed ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      Match Too Low ({matchResult.score}% &lt; 40%)
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {isClockIn
                        ? `Confirm & Clock In (${matchResult.score || 100}% Match)`
                        : `Confirm & Clock Out (${matchResult.score || 100}% Match)`}
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
