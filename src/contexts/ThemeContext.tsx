import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  radius: string;
}

const ThemeContext = createContext<ThemeConfig | null>(null);

// Helper function to convert hex to HSL string component
function hexToHsl(hex: string): { h: number, s: number, l: number } | null {
  if (!hex) return null;
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data } = await supabase.from('theme_config').select('*').single();
        if (data) {
          setTheme(data);
          applyTheme(data);
        }
      } catch (error) {
        console.error("Could not fetch theme config:", error);
      }
    };
    fetchTheme();
  }, []);

  const applyTheme = (config: ThemeConfig) => {
    const root = document.documentElement;
    if (config.primary_color) {
      const hsl = hexToHsl(config.primary_color);
      if (hsl) {
        root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      }
    }
    if (config.secondary_color) {
      const hsl = hexToHsl(config.secondary_color);
      if (hsl) {
        root.style.setProperty('--secondary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      }
    }
    if (config.radius) {
      root.style.setProperty('--radius', config.radius);
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);