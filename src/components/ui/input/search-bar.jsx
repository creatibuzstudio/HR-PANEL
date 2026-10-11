import { search } from "@/assets/icons/svgIcons";
import React from "react";

const SearchBar = ({
  placeholder = "Search Items",
  searchValue,
  setSearchValue,
  className = "",
}) => {
  return (
    <div className="relative">
      <input
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className={`bg-bg50 py-2 pr-4 pl-8 rounded-full text-sm outline-none border border-blue-100 dark:border-white/20 dark:placeholder:text-white/50 placeholder:text-black/50 ${className}`}
      />
      <span className="absolute top-1/2 -translate-y-1/2 left-3">{search}</span>
    </div>
  );
};

export default SearchBar;
