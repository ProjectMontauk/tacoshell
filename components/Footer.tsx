import React from "react";

const Footer = () => (
  <footer className="w-full bg-white h-25 pt-2 border-t-2 border-gray-200 shadow flex flex-col justify-center">
    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8">
      <div className="py-1 px-3 rounded-md text-xs font-semibold text-black bg-white transition" style={{minWidth: 0}}>
        Contact:
      </div>
      <div className="py-1 px-3 rounded-md text-xs font-semibold text-black bg-white transition" style={{minWidth: 0}}>
        trevor@tinfoilnews.com
      </div>
      <div className="py-1 px-3 rounded-md text-xs font-semibold text-black bg-white transition" style={{minWidth: 0}}>
        631-356-9643
      </div>
    </div>
  </footer>
);

export default Footer; 