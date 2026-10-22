import React from "react";
import { THEME_PALETTES } from "./BirthdayPosterCanvas";

export default function BirthdayCardPreview({
  name = "Team Member",
  designation = "Employee",
  department = "Creatibuz Studio",
  picture = "",
  wishMessage = "Wishing you another wonderful year of happiness, great achievements, and vibrant health! Thank you for your passion, creativity, and invaluable contributions to Creatibuz Studio.",
  theme = "creatibuz",
  showLogo = true,
  className = "",
}) {
  const palette = THEME_PALETTES[theme] || THEME_PALETTES.creatibuz;
  const isDark = theme === "midnight";

  return (
    <div
      className={`relative aspect-square w-full select-none overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${
        isDark ? "bg-[#18181B] text-white" : "bg-white text-gray-900"
      } ${className}`}
      style={{
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {/* Outer framing line */}
      <div
        className="absolute inset-2 sm:inset-3 pointer-events-none rounded-xl"
        style={{
          border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)",
        }}
      />

      {/* Top Creatibuz Studio Logo */}
      {showLogo && (
        <div className="absolute top-2.5 sm:top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
          <img
            src="/creatibuz-logo.png"
            alt="Creatibuz Studio"
            className="h-5 sm:h-7.5 max-w-[130px] sm:max-w-[160px] object-contain drop-shadow-xs"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Top Garland / Bunting Pennants (Left & Right) */}
      <svg
        className="absolute top-0 left-0 w-2/5 h-20 pointer-events-none opacity-85"
        viewBox="0 0 200 90"
        fill="none"
      >
        <path
          d="M 10 10 Q 100 70 195 75"
          stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(156,163,175,0.4)"}
          strokeWidth="1.2"
        />
        {/* Pennants */}
        {[
          { x1: 15, y1: 15, x2: 38, y2: 27, tx: 26, ty: 58, fill: isDark ? "#27272A" : "#F3F4F6" },
          { x1: 42, y1: 29, x2: 68, y2: 44, tx: 55, ty: 72, fill: isDark ? "#3F3F46" : "#E5E7EB" },
          { x1: 72, y1: 46, x2: 100, y2: 58, tx: 86, ty: 85, fill: isDark ? "#52525B" : "#FFFFFF" },
          { x1: 104, y1: 60, x2: 135, y2: 68, tx: 120, ty: 89, fill: isDark ? "#3F3F46" : "#E5E7EB" },
          { x1: 139, y1: 69, x2: 172, y2: 73, tx: 155, ty: 90, fill: isDark ? "#27272A" : "#F3F4F6" },
        ].map((p, idx) => (
          <polygon
            key={idx}
            points={`${p.x1},${p.y1} ${p.x2},${p.y2} ${p.tx},${p.ty}`}
            fill={p.fill}
            stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(156,163,175,0.3)"}
            strokeWidth="0.8"
          />
        ))}
      </svg>

      <svg
        className="absolute top-0 right-0 w-2/5 h-20 pointer-events-none opacity-85 transform scale-x-[-1]"
        viewBox="0 0 200 90"
        fill="none"
      >
        <path
          d="M 10 10 Q 100 70 195 75"
          stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(156,163,175,0.4)"}
          strokeWidth="1.2"
        />
        {[
          { x1: 15, y1: 15, x2: 38, y2: 27, tx: 26, ty: 58, fill: isDark ? "#27272A" : "#F3F4F6" },
          { x1: 42, y1: 29, x2: 68, y2: 44, tx: 55, ty: 72, fill: isDark ? "#3F3F46" : "#E5E7EB" },
          { x1: 72, y1: 46, x2: 100, y2: 58, tx: 86, ty: 85, fill: isDark ? "#52525B" : "#FFFFFF" },
          { x1: 104, y1: 60, x2: 135, y2: 68, tx: 120, ty: 89, fill: isDark ? "#3F3F46" : "#E5E7EB" },
          { x1: 139, y1: 69, x2: 172, y2: 73, tx: 155, ty: 90, fill: isDark ? "#27272A" : "#F3F4F6" },
        ].map((p, idx) => (
          <polygon
            key={idx}
            points={`${p.x1},${p.y1} ${p.x2},${p.y2} ${p.tx},${p.ty}`}
            fill={p.fill}
            stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(156,163,175,0.3)"}
            strokeWidth="0.8"
          />
        ))}
      </svg>

      {/* Celebratory Sparkle Stars & Confetti Particles */}
      <div className="absolute top-[10%] left-[38%] pointer-events-none opacity-80">
        <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill={palette.accent}>
          <path d="M12 0L14 9L23 11L14 13L12 22L10 13L1 11L10 9Z" />
        </svg>
      </div>
      <div className="absolute top-[7%] left-[42%] pointer-events-none opacity-60">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={palette.accent}>
          <path d="M12 0L14 9L23 11L14 13L12 22L10 13L1 11L10 9Z" />
        </svg>
      </div>
      <div className="absolute bottom-[28%] right-[8%] pointer-events-none opacity-80">
        <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill={palette.accent}>
          <path d="M12 0L14 9L23 11L14 13L12 22L10 13L1 11L10 9Z" />
        </svg>
      </div>

      {/* Cute Isometric Gift Box Accent at bottom right */}
      <div className="absolute bottom-[24%] right-[6%] pointer-events-none opacity-70 hidden sm:block">
        <svg className="w-14 h-14" viewBox="0 0 60 60" fill="none">
          {/* Top Diamond */}
          <polygon points="30,8 50,18 30,28 10,18" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
          {/* Left Face */}
          <polygon points="10,18 30,28 30,48 10,38" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
          {/* Right Face */}
          <polygon points="30,28 50,18 50,38 30,48" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
          {/* Ribbon */}
          <line x1="20" y1="23" x2="20" y2="43" stroke={palette.accent} strokeWidth="3" />
          <ellipse cx="30" cy="18" rx="4" ry="2" fill={palette.accent} />
        </svg>
      </div>

      {/* Main Card Content Grid */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-9">
        {/* Top & Middle Section: Photo & Typography */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6 items-center pt-5 sm:pt-7">
          {/* Left Column: Photo with Double Accent Frame */}
          <div className="col-span-5 relative flex justify-center">
            {/* The signature offset accent frame border */}
            <div
              className="absolute -top-2.5 -left-2.5 sm:-top-3 sm:-left-3 w-full h-full rounded-md pointer-events-none transition-all duration-300"
              style={{
                border: `3px solid ${palette.borderAccent}`,
              }}
            />

            {/* Photo Container */}
            <div
              className="relative w-full aspect-[4/5] rounded-sm overflow-hidden shadow-xl"
              style={{ backgroundColor: palette.photoBg }}
            >
              {picture ? (
                <img
                  src={picture}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                />
              ) : null}

              {/* Fallback Initials Avatar if image fails or missing */}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center text-white font-bold ${
                  picture ? "-z-10" : "z-0"
                }`}
              >
                <span className="text-3xl sm:text-5xl font-extrabold tracking-wider">
                  {(name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <span className="text-[10px] sm:text-xs font-medium opacity-85 mt-1">
                  Creatibuz Team
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Typography & Name/Designation */}
          <div className="col-span-7 flex flex-col justify-center pl-1 sm:pl-3">
            {/* Cursive "Happy" */}
            <div
              className="text-4xl sm:text-6xl font-bold tracking-wide italic leading-none transition-colors"
              style={{
                color: palette.accent,
                fontFamily: "'Dancing Script', 'Caveat', cursive",
              }}
            >
              Happy
            </div>

            {/* Bold Sans "BIRTHDAY" */}
            <div
              className={`text-2xl sm:text-4xl lg:text-[42px] font-black uppercase tracking-wider leading-tight mt-0.5 sm:mt-1 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
              style={{ fontFamily: "'Poppins', 'Montserrat', sans-serif" }}
            >
              BIRTHDAY
            </div>

            {/* Employee Name */}
            <div className="mt-4 sm:mt-6">
              <h3
                className={`text-base sm:text-xl lg:text-2xl font-extrabold uppercase tracking-tight line-clamp-1 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {name}
              </h3>
              <p
                className={`text-xs sm:text-sm font-semibold tracking-wide mt-0.5 sm:mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {designation}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Quote Wish & Brand Footer */}
        <div className="space-y-4 pt-3 sm:pt-4">
          {/* Quote Section */}
          <div className="flex items-start gap-2.5 sm:gap-3 bg-gray-50/50 dark:bg-zinc-900/40 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-zinc-800/80">
            <span
              className="text-3xl sm:text-4xl font-serif font-black leading-none select-none flex-shrink-0"
              style={{ color: palette.quoteColor }}
            >
              “
            </span>
            <p
              className={`text-xs sm:text-sm font-normal italic leading-relaxed line-clamp-3 sm:line-clamp-4 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {wishMessage}
            </p>
          </div>

          {/* Creatibuz Brand Watermark & Tagline */}
          {showLogo && (
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800/80 pt-2.5 text-[10px] sm:text-xs text-gray-400">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-primary">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: palette.accent }}
                />
                CREATIBUZ STUDIO
              </div>
              <span className="font-medium text-[9px] sm:text-[11px] tracking-wide">
                Official Birthday Announcement
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
