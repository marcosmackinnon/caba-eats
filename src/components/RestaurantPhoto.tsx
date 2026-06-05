"use client";

import { useState } from "react";

interface RestaurantPhotoProps {
  src: string;
  alt: string;
  /** Clase Tailwind del gradiente de color (fallback si la foto no carga) */
  fallbackClassName: string;
  /** Clase Tailwind del overlay oscuro encima de la foto */
  overlayClassName: string;
  /** Clases del contenedor (altura, bordes, etc.) */
  className?: string;
  children?: React.ReactNode;
}

export default function RestaurantPhoto({
  src,
  alt,
  fallbackClassName,
  overlayClassName,
  className = "",
  children,
}: RestaurantPhotoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className} ${fallbackClassName}`}>
      {!imgFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      )}
      {/* Overlay oscuro para que badges y texto sean legibles */}
      <div className={`absolute inset-0 bg-gradient-to-t ${overlayClassName}`} />
      {children}
    </div>
  );
}
