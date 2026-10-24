// BirthdayPosterCanvas.js
// Official Creatibuz Studio Birthday Poster Rendering Engine
// Exactly matching the official brand poster design (100% same to same).

export const THEME_PALETTES = {
  creatibuz: {
    id: "creatibuz",
    name: "Creatibuz Brand Theme (Official)",
    accent: "#F15A24",
    accentLight: "#FFF4ED",
    accentDark: "#C23F10",
    bgGradient: ["#FFFFFF", "#FFF9F5"],
    photoBg: "#F15A24",
    textColor: "#111827",
    subTextColor: "#4B5563",
    quoteColor: "#F15A24",
    buntingColor: "#E5E7EB",
    borderAccent: "#F15A24",
    sparkleColor: "#FDBA74",
  },
};

/**
 * Load image safely with CORS support
 */
const loadImage = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => resolve(null);
      fallbackImg.src = src;
    };
    img.src = src;
  });
};

/**
 * Main rendering function onto an HTML5 Canvas
 */
export const renderBirthdayPoster = async (canvas, options = {}) => {
  if (!canvas) return;

  const {
    name = "Md Golam Rabbi",
    designation = "Website Developer",
    picture = "",
  } = options;

  // Exact reference dimensions (818 x 1024), scaled 2x for ultra-sharp HD export
  const exportScale = 2;
  const baseW = 818;
  const baseH = 1024;

  canvas.width = baseW * exportScale;
  canvas.height = baseH * exportScale;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.save();
  ctx.scale(exportScale, exportScale);

  // Check if a custom photo is provided
  const isCustomPic =
    picture &&
    typeof picture === "string" &&
    !picture.includes("birthday-default") &&
    !picture.includes("media_1792841785549");

  if (isCustomPic) {
    // 1. Draw Clean Background with wave lines and Creatibuz logo
    const bgImg = await loadImage("/birthday/birthday-clean-bg.png");
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, baseW, baseH);
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, baseW, baseH);
    }

    // 2. Draw Custom Employee Photo in portrait area
    const empImg = await loadImage(picture);
    if (empImg) {
      ctx.save();
      // Clip to upper section so photo does not bleed below the card line (y = 703)
      ctx.beginPath();
      ctx.rect(0, 100, baseW, 603);
      ctx.clip();

      const photoMaxW = 480;
      const photoMaxH = 580;
      const scale = Math.min(photoMaxW / empImg.width, photoMaxH / empImg.height);
      const drawW = empImg.width * scale;
      const drawH = empImg.height * scale;
      const drawX = (baseW - drawW) / 2;
      const drawY = 703 - drawH; // Align bottom of photo with top of card

      ctx.drawImage(empImg, drawX, drawY, drawW, drawH);
      ctx.restore();
    }

    // 3. Draw Bottom Celebratory Overlay ("Happy Birthday", confetti, streamers, party hat)
    const overlayImg = await loadImage("/birthday/birthday-bottom-overlay.png");
    if (overlayImg) {
      ctx.drawImage(overlayImg, 0, 680, baseW, 344);
    }
  } else {
    // Default reference image template
    const templateImg = await loadImage("/birthday/birthday-clean-template.png");
    if (templateImg) {
      ctx.drawImage(templateImg, 0, 0, baseW, baseH);
    } else {
      const fallbackImg = await loadImage("/birthday/birthday-reference-full.png");
      if (fallbackImg) ctx.drawImage(fallbackImg, 0, 0, baseW, baseH);
    }
  }

  // Draw Name: Centered, Bold, crisp black
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const displayName = name || "Md Golam Rabbi";
  ctx.fillStyle = "#000000";
  ctx.font = "800 32px 'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(displayName, 409, 948);

  // Draw Designation: Centered, Medium, dark gray
  const displayRole = designation || "Website Developer";
  ctx.fillStyle = "#1F2937";
  ctx.font = "500 18px 'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(displayRole, 409, 976);

  ctx.restore();

  ctx.restore();
  return canvas;
};

/**
 * Download high-resolution poster as PNG file
 */
export const downloadBirthdayPosterPNG = async (options = {}) => {
  const offscreenCanvas = document.createElement("canvas");
  await renderBirthdayPoster(offscreenCanvas, options);

  return new Promise((resolve) => {
    offscreenCanvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const safeName = (options.name || "Md_Golam_Rabbi")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_");
        link.download = `Creatibuz_Birthday_${safeName}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve(true);
      },
      "image/png",
      1.0
    );
  });
};

/**
 * Copy poster PNG image directly to clipboard
 */
export const copyBirthdayPosterToClipboard = async (options = {}) => {
  const offscreenCanvas = document.createElement("canvas");
  await renderBirthdayPoster(offscreenCanvas, options);

  return new Promise((resolve, reject) => {
    offscreenCanvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Failed to generate image blob"));
          return;
        }
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            resolve(true);
          } else {
            reject(new Error("Clipboard API not supported"));
          }
        } catch (err) {
          reject(err);
        }
      },
      "image/png",
      1.0
    );
  });
};
