"use client";
import Image from "next/image";
import { useState } from "react";

const fallback = "/images/placeholder.svg";

export default function SafeImage({ src, alt = "", onError, unoptimized, fallbackSrc = fallback, ...props }) {
  const candidate = Array.isArray(src) ? src.find(value => typeof value === "string" && value.trim()) : src;
  const source = typeof candidate === "string" && candidate.trim() ? candidate : fallback;
  const [failedSource, setFailedSource] = useState(null);
  const current = failedSource === source ? fallbackSrc : source;
  return (
    <Image
      {...props}
      alt={alt}
      src={current}
      unoptimized={unoptimized || /^(https?:|blob:)/i.test(current) || current.endsWith(".svg")}
      onError={event => {
        if (process.env.NODE_ENV !== 'production') console.warn('Product image failed to load:', source);
        setFailedSource(source); onError?.(event);
      }}
    />
  );
}

