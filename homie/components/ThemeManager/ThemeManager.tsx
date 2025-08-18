'use client';

import { useEffect, useState } from 'react';

export default function ThemeManager() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined' && window.localStorage) {
      const theme = localStorage.getItem("theme") || "default";
      const themeWrapper = document.getElementById("theme-wrapper");
      if (themeWrapper) {
        themeWrapper.className += theme === "default" ? " bg-bgPrimary" : " bg-gray-100";
      }
    } else {
      const theme = "default";
      const themeWrapper = document.getElementById("theme-wrapper");
      if (themeWrapper) {
        themeWrapper.className += theme === "default" ? " bg-bgPrimary" : " bg-gray-100";
      }
    }
  }, [isMounted]);
  if (!isMounted) {
    return null; 
  }

  return null;
}
