// Birthday Poster Canvas Rendering Engine for Facebook Post (1200x1200px)
// Inspired directly by the user's reference design and Creatibuz Studio brand theme.

export const THEME_PALETTES = {
  creatibuz: {
    id: "creatibuz",
    name: "Creatibuz Orange (Brand Theme)",
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
  emerald: {
    id: "emerald",
    name: "Emerald Mint (Reference Design)",
    accent: "#0D9488",
    accentLight: "#F0FDFA",
    accentDark: "#0F766E",
    bgGradient: ["#FFFFFF", "#F6FAF9"],
    photoBg: "#0D9488",
    textColor: "#111827",
    subTextColor: "#4B5563",
    quoteColor: "#0D9488",
    buntingColor: "#E5E7EB",
    borderAccent: "#0D9488",
    sparkleColor: "#99F6E4",
  },
  indigo: {
    id: "indigo",
    name: "Royal Indigo",
    accent: "#4F46E5",
    accentLight: "#EEF2FF",
    accentDark: "#3730A3",
    bgGradient: ["#FFFFFF", "#F8FAFC"],
    photoBg: "#4F46E5",
    textColor: "#0F172A",
    subTextColor: "#475569",
    quoteColor: "#4F46E5",
    buntingColor: "#E2E8F0",
    borderAccent: "#4F46E5",
    sparkleColor: "#C7D2FE",
  },
  gold: {
    id: "gold",
    name: "Celebration Gold",
    accent: "#D97706",
    accentLight: "#FFFBEB",
    accentDark: "#B45309",
    bgGradient: ["#FFFFFF", "#FFFDF5"],
    photoBg: "#D97706",
    textColor: "#18181B",
    subTextColor: "#52525B",
    quoteColor: "#D97706",
    buntingColor: "#E4E4E7",
    borderAccent: "#D97706",
    sparkleColor: "#FDE68A",
  },
  midnight: {
    id: "midnight",
    name: "Midnight Luxury (Dark)",
    accent: "#F97316",
    accentLight: "#27272A",
    accentDark: "#EA580C",
    bgGradient: ["#18181B", "#09090B"],
    photoBg: "#27272A",
    textColor: "#F9FAFB",
    subTextColor: "#9CA3AF",
    quoteColor: "#F97316",
    buntingColor: "#3F3F46",
    borderAccent: "#F97316",
    sparkleColor: "#FB923C",
  },
};

/**
 * Load an image safely with CORS handling
 */
const loadImage = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If CORS or error occurs, try without crossOrigin
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = () => resolve(null);
      fallbackImg.src = src;
    };
    img.src = src;
  });
};

/**
 * Helper to draw 4-pointed sparkle stars
 */
const drawSparkle = (ctx, cx, cy, radius, color) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  // 4-pointed star curve
  const innerRadius = radius * 0.22;
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? radius : innerRadius;
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

/**
 * Helper to draw festive bunting garland flags
 */
const drawBunting = (ctx, startX, startY, endX, endY, sag, count, colors) => {
  ctx.save();
  // Draw garland string
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 + sag;
  ctx.quadraticCurveTo(midX, midY, endX, endY);
  ctx.strokeStyle = "rgba(156, 163, 175, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw triangular pennants along curve
  for (let i = 0; i < count; i++) {
    const t1 = (i + 0.1) / count;
    const t2 = (i + 0.9) / count;
    const tMid = (t1 + t2) / 2;

    const getBezierPt = (t) => {
      const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
      const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
      return { x, y };
    };

    const p1 = getBezierPt(t1);
    const p2 = getBezierPt(t2);
    const pMid = getBezierPt(tMid);

    // Tip hangs down
    const flagHeight = 44;
    const tipX = pMid.x;
    const tipY = pMid.y + flagHeight;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();

    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(156, 163, 175, 0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
};

/**
 * Helper to draw 3D isometric gift box
 */
const drawIsometricGiftBox = (ctx, cx, cy, size, ribbonColor) => {
  ctx.save();
  ctx.translate(cx, cy);

  const halfW = size * 0.55;
  const h = size * 0.4;
  const drop = size * 0.45;

  // Top Face (Diamond)
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(halfW, 0);
  ctx.lineTo(0, h);
  ctx.lineTo(-halfW, 0);
  ctx.closePath();
  ctx.fillStyle = "#F3F4F6";
  ctx.fill();
  ctx.strokeStyle = "#D1D5DB";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Left Face
  ctx.beginPath();
  ctx.moveTo(-halfW, 0);
  ctx.lineTo(0, h);
  ctx.lineTo(0, h + drop);
  ctx.lineTo(-halfW, drop);
  ctx.closePath();
  ctx.fillStyle = "#E5E7EB";
  ctx.fill();
  ctx.stroke();

  // Right Face
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(halfW, 0);
  ctx.lineTo(halfW, drop);
  ctx.lineTo(0, h + drop);
  ctx.closePath();
  ctx.fillStyle = "#D1D5DB";
  ctx.fill();
  ctx.stroke();

  // Ribbon on Left face
  ctx.beginPath();
  const rw = halfW * 0.22;
  ctx.moveTo(-halfW * 0.5 - rw / 2, drop * 0.5);
  ctx.lineTo(-halfW * 0.5 + rw / 2, drop * 0.5 + h * 0.2);
  ctx.lineTo(-halfW * 0.5 + rw / 2, drop * 1.5 + h * 0.2);
  ctx.lineTo(-halfW * 0.5 - rw / 2, drop * 1.5);
  ctx.closePath();
  ctx.fillStyle = ribbonColor;
  ctx.fill();

  // Ribbon Bow on Top
  ctx.beginPath();
  ctx.ellipse(-size * 0.15, -h * 0.6, size * 0.18, size * 0.1, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = ribbonColor;
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(size * 0.15, -h * 0.6, size * 0.18, size * 0.1, Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = ribbonColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, -h * 0.3, size * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = ribbonColor;
  ctx.fill();

  ctx.restore();
};

/**
 * Text wrapping utility for HTML5 canvas
 */
const wrapText = (ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) => {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + " ";
      if (lines.length >= maxLines - 1) {
        break;
      }
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  lines.forEach((l, index) => {
    ctx.fillText(l, x, y + index * lineHeight);
  });

  return lines.length;
};

/**
 * Main rendering function onto an HTML5 Canvas
 */
export const renderBirthdayPoster = async (canvas, options = {}) => {
  if (!canvas) return;

  const {
    name = "Team Member",
    designation = "Employee",
    department = "Creatibuz Studio",
    picture = "",
    wishMessage = "Wishing you another wonderful year of happiness, great achievements, and vibrant health! Thank you for your passion, creativity, and invaluable contributions to Creatibuz Studio. Have a fantastic celebration!",
    theme = "creatibuz",
    showLogo = true,
    logoUrl = "/creatibuz-logo.png",
  } = options;

  const palette = THEME_PALETTES[theme] || THEME_PALETTES.creatibuz;
  const isDark = theme === "midnight";

  const finalSize = 1080;
  canvas.width = finalSize;
  canvas.height = finalSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const baseSize = 1200;
  const width = baseSize;
  const height = baseSize;
  const scale = finalSize / baseSize; // 1080 / 1200 = 0.9

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Background Fill with subtle gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, palette.bgGradient[0]);
  bgGrad.addColorStop(1, palette.bgGradient[1]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Elegant poster border frame
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, width - 16, height - 16);

  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  // 2. Festive Bunting Pennants (Top-left & Top-right)
  const pennantColors = isDark
    ? ["#27272A", "#3F3F46", "#52525B", "#3F3F46", "#27272A"]
    : ["#FFFFFF", "#F3F4F6", "#E5E7EB", "#F9FAFB", "#E5E7EB"];

  // Top Left Garland
  drawBunting(ctx, 30, 20, 440, 160, 45, 6, pennantColors);

  // Top Right Garland
  drawBunting(ctx, width - 30, 20, width - 440, 160, 45, 6, pennantColors);

  // 2.5. Top Creatibuz Studio Logo ("upore amder logo hobe")
  if (showLogo) {
    let topLogoImg = null;
    if (logoUrl) {
      topLogoImg = await loadImage(logoUrl);
    }

    ctx.save();
    const topLogoY = 50;
    if (topLogoImg) {
      const logoH = 75;
      const logoW = (topLogoImg.width / topLogoImg.height) * logoH;
      const logoX = width / 2 - logoW / 2;
      ctx.drawImage(topLogoImg, logoX, topLogoY, logoW, logoH);
    } else {
      ctx.fillStyle = palette.accent;
      ctx.font = "800 32px 'Poppins', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CREATIBUZ STUDIO", width / 2, topLogoY + 48);
    }
    ctx.restore();
  }

  // 3. Celebratory Sparkle Stars & Confetti
  // Top center sparkles
  drawSparkle(ctx, 450, 100, 16, palette.sparkleColor);
  drawSparkle(ctx, 490, 80, 10, palette.sparkleColor);
  drawSparkle(ctx, 470, 140, 12, palette.sparkleColor);
  drawSparkle(ctx, 430, 130, 8, palette.sparkleColor);

  // Scattered sparkles
  drawSparkle(ctx, 1100, 260, 14, palette.sparkleColor);
  drawSparkle(ctx, 1070, 230, 8, palette.sparkleColor);
  drawSparkle(ctx, 1120, 310, 10, palette.sparkleColor);

  // Bottom right sparkles
  drawSparkle(ctx, 1060, 870, 18, palette.sparkleColor);
  drawSparkle(ctx, 1095, 840, 11, palette.sparkleColor);
  drawSparkle(ctx, 1040, 910, 12, palette.sparkleColor);
  drawSparkle(ctx, 1115, 890, 9, palette.sparkleColor);

  // Bottom left confetti
  drawSparkle(ctx, 120, 890, 11, palette.sparkleColor);
  drawSparkle(ctx, 150, 920, 7, palette.sparkleColor);

  // Confetti sprinkles
  const confettiPoints = [
    { x: 1040, y: 150, w: 12, h: 5, r: 0.4 },
    { x: 1090, y: 180, w: 10, h: 4, r: -0.6 },
    { x: 1130, y: 140, w: 8, h: 4, r: 0.8 },
    { x: 90, y: 880, w: 11, h: 5, r: 0.5 },
    { x: 140, y: 850, w: 8, h: 4, r: -0.3 },
    { x: 1020, y: 840, w: 12, h: 5, r: 0.2 },
  ];
  ctx.save();
  confettiPoints.forEach((c) => {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.r);
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.15)" : "rgba(203, 213, 225, 0.7)";
    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
    ctx.restore();
  });
  ctx.restore();

  // 3D Isometric Gift Boxes (Subtle, celebratory accent at mid-right and bottom-left)
  drawIsometricGiftBox(ctx, 1060, 710, 100, palette.accent);
  drawIsometricGiftBox(ctx, 620, 720, 70, isDark ? "#3F3F46" : "#E2E8F0");

  // 4. Employee Photo & Distinctive Double Accent Frame (Left side)
  const photoW = 410;
  const photoH = 510;
  const photoX = 140;
  const photoY = 240;

  // Offset Accent Outer Frame (exactly matching the user reference photo!)
  // The accent border is shifted upward & rightward
  const frameOffset = 30;
  ctx.save();
  ctx.strokeStyle = palette.borderAccent;
  ctx.lineWidth = 5;
  ctx.strokeRect(
    photoX - frameOffset,
    photoY - frameOffset,
    photoW + frameOffset,
    photoH + frameOffset
  );
  ctx.restore();

  // Draw Photo Container
  ctx.save();
  // Photo Shadow
  ctx.shadowColor = isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.14)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 12;

  // Photo Background Box
  ctx.fillStyle = palette.photoBg;
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.restore();

  // Load and Draw Employee Picture
  let loadedImg = null;
  if (picture) {
    loadedImg = await loadImage(picture);
  }

  ctx.save();
  // Clip inside photo area
  ctx.beginPath();
  ctx.rect(photoX, photoY, photoW, photoH);
  ctx.clip();

  if (loadedImg) {
    // Cover fit
    const imgRatio = loadedImg.width / loadedImg.height;
    const boxRatio = photoW / photoH;
    let sW, sH, sX, sY;

    if (imgRatio > boxRatio) {
      sH = loadedImg.height;
      sW = sH * boxRatio;
      sX = (loadedImg.width - sW) / 2;
      sY = 0;
    } else {
      sW = loadedImg.width;
      sH = sW / boxRatio;
      sX = 0;
      sY = (loadedImg.height - sH) / 2;
    }
    ctx.drawImage(loadedImg, sX, sY, sW, sH, photoX, photoY, photoW, photoH);
  } else {
    // Stylized Fallback Avatar
    const avatarGrad = ctx.createLinearGradient(photoX, photoY, photoX + photoW, photoY + photoH);
    avatarGrad.addColorStop(0, palette.accent);
    avatarGrad.addColorStop(1, palette.accentDark);
    ctx.fillStyle = avatarGrad;
    ctx.fillRect(photoX, photoY, photoW, photoH);

    // Initial letters
    const initials = (name || "Creatibuz")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 110px 'Poppins', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, photoX + photoW / 2, photoY + photoH / 2 - 20);

    ctx.font = "500 24px 'Poppins', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText("Creatibuz Team", photoX + photoW / 2, photoY + photoH / 2 + 60);
  }
  ctx.restore();

  // Subtle clean photo inner border
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";
  ctx.lineWidth = 2;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  // 5. Right Section: Typography (Happy BIRTHDAY, Name & Role)
  const rightX = 640;

  // "Happy" in cursive brush script (Dancing Script / Caveat)
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.font = "bold 115px 'Dancing Script', 'Caveat', cursive";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Happy", rightX, 360);
  ctx.restore();

  // "BIRTHDAY" in Bold Grotesque Sans
  ctx.save();
  ctx.fillStyle = palette.textColor;
  ctx.font = "900 84px 'Poppins', 'Montserrat', 'Inter', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Letter spacing emulation
  const birthdayText = "BIRTHDAY";
  let letterX = rightX;
  const letterSpacing = 4;
  for (let i = 0; i < birthdayText.length; i++) {
    const char = birthdayText[i];
    ctx.fillText(char, letterX, 450);
    letterX += ctx.measureText(char).width + letterSpacing;
  }
  ctx.restore();

  // Employee Name
  ctx.save();
  const displayName = name.toUpperCase();
  ctx.fillStyle = palette.textColor;
  ctx.font = "800 36px 'Poppins', 'Montserrat', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const nameCenter = 850;
  ctx.fillText(displayName, nameCenter, 615);

  // Designation Only (Department removed per user specification)
  ctx.fillStyle = palette.subTextColor;
  ctx.font = "500 26px 'Poppins', 'Inter', sans-serif";
  const roleText = designation || "Team Member";
  ctx.fillText(roleText, nameCenter, 655);
  ctx.restore();

  // 6. Bottom Quote / Birthday Wish Section
  const quoteStartX = 180;
  const quoteTextX = 240;
  const quoteY = 860;
  const quoteMaxW = 820;

  // Quotation icon `“`
  ctx.save();
  ctx.fillStyle = palette.quoteColor;
  ctx.font = "bold 96px Georgia, serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("“", quoteStartX, quoteY - 30);

  // Wish message text
  ctx.fillStyle = isDark ? "#E5E7EB" : "#374151";
  ctx.font = "500 22px 'Poppins', 'Inter', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  wrapText(ctx, wishMessage, quoteTextX, quoteY, quoteMaxW, 36, 4);
  ctx.restore();

  // 7. Footer Tagline
  if (showLogo) {
    const footerY = 1125;
    ctx.save();
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.45)" : "rgba(100, 116, 139, 0.75)";
    ctx.font = "600 15px 'Poppins', 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OFFICIAL BIRTHDAY ANNOUNCEMENT • CREATIBUZSTUDIO.COM", width / 2, footerY);
    ctx.restore();
  }

  // Restore initial scale transformation
  ctx.restore();

  return canvas;
};

/**
 * Download high-resolution poster as PNG file (1080x1080 1:1 Square)
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
        const safeName = (options.name || "Employee")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_");
        link.download = `Creatibuz_Birthday_Poster_${safeName}_1080x1080.png`;
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
