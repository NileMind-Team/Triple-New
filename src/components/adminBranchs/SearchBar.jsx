import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({ searchTerm, setSearchTerm, placeholder }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative group">
        <FaSearch
          className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110 text-sm sm:text-base"
          style={{ color: "#2E3E88" }}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-[#2E3E88]/30 focus:border-[#2E3E88] transition-all duration-200 shadow-lg text-sm sm:text-base"
          style={{
            background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
          }}
          placeholder={placeholder}
          dir="rtl"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#2E3E88] transition-colors duration-200"
          >
            <FaTimes size={14} className="sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
