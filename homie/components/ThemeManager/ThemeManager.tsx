'use client'; 

import { useEffect } from 'react';

export default function ThemeManager() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'default';

    const themeWrapper = document.getElementById('theme-wrapper');

    if (themeWrapper) {
      themeWrapper.className += theme === 'default' ? ' bg-bgPrimary' : ' bg-gray-100';
    }
  }, []); 

  return null;
}
