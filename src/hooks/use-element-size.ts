"use client";

import { useState, useEffect, useRef } from "react";

export function useElementSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1200, height: 0 }); // Valor inicial seguro

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });

    observer.observe(element);

    return () => {
      element && observer.unobserve(element);
    };
  }, []);

  return { ref, width: size.width, height: size.height };
}