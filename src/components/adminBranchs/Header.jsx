import React from "react";
import { FaBuilding } from "react-icons/fa";
import { motion } from "framer-motion";

const Header = ({ title, subtitle }) => {
  return (
    <div className="relative h-52 bg-gradient-to-r from-[#2E3E88] to-[#32B9CC] overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full"></div>
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full"></div>

      <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-3"
        >
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
            <FaBuilding className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-white">{title}</h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/90 text-xl max-w-2xl mb-3"
        >
          {subtitle}
        </motion.p>
      </div>
    </div>
  );
};

export default Header;
