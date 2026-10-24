import React from "react";

export default function BirthdayCardPreview({
  name = "Md Golam Rabbi",
  designation = "Website Developer",
  picture = "",
  className = "",
}) {
  const isCustomPic =
    picture &&
    typeof picture === "string" &&
    !picture.includes("birthday-default") &&
    !picture.includes("media_1792841785549");

  return (
    <div
      className={`relative aspect-[818/1024] w-full select-none overflow-hidden rounded-2xl shadow-2xl bg-white border border-gray-100 dark:border-zinc-800 ${className}`}
    >
      {isCustomPic ? (
        <>
          {/* Base Clean Background with wave lines and Creatibuz logo */}
          <img
            src="/birthday/birthday-clean-bg.png"
            alt="Birthday Template"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Custom Employee Photo */}
          <div className="absolute top-[12.8%] left-1/2 -translate-x-1/2 w-[58%] h-[56%] overflow-hidden flex items-end justify-center pointer-events-none">
            <img
              src={picture}
              alt={name}
              className="w-full h-full object-contain object-bottom"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          {/* Bottom Celebratory Overlay ("Happy Birthday", confetti, streamers, party hat) */}
          <img
            src="/birthday/birthday-bottom-overlay.png"
            alt="Celebration Overlay"
            className="absolute bottom-0 left-0 w-full object-cover pointer-events-none"
            style={{ height: "33.6%" }}
          />
        </>
      ) : (
        /* Default Reference Design (Same to same) */
        <img
          src="/birthday/birthday-clean-template.png"
          alt="Birthday Poster Template"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dynamic Name */}
      <div
        className="absolute w-full text-center px-4 pointer-events-none"
        style={{ top: "91.8%" }}
      >
        <h3 className="text-[3.8cqw] sm:text-[3.5cqw] md:text-[23px] lg:text-[26px] font-extrabold text-black tracking-tight leading-none font-sans">
          {name || "Md Golam Rabbi"}
        </h3>
      </div>

      {/* Dynamic Designation */}
      <div
        className="absolute w-full text-center px-4 pointer-events-none"
        style={{ top: "94.8%" }}
      >
        <p className="text-[2.3cqw] sm:text-[2.1cqw] md:text-[14px] lg:text-[16px] font-medium text-gray-800 tracking-normal leading-none font-sans">
          {designation || "Website Developer"}
        </p>
      </div>
    </div>
  );
}
