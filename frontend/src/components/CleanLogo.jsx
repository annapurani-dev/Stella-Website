import React, { useEffect, useState } from 'react';

export default function CleanLogo({ className, style, height = 48, ...props }) {
  const [logoSrc, setLogoSrc] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/logo2.jpeg';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // key out pixels that are very close to black
      // Since it's a JPEG, the background is not perfectly uniform black.
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate maximum component intensity
        const maxVal = Math.max(r, g, b);

        if (maxVal < 45) {
          data[i + 3] = 0; // Completely transparent
        } else if (maxVal < 90) {
          // Smooth transition/feathering to avoid jaggy edges
          const ratio = (maxVal - 45) / (90 - 45);
          data[i + 3] = Math.floor(ratio * 255);
        }
      }
      ctx.putImageData(imgData, 0, 0);
      setLogoSrc(canvas.toDataURL());
    };
    img.onerror = () => {
      // Fallback to direct image source if canvas manipulation fails
      setLogoSrc('/logo2.jpeg');
    };
  }, []);

  if (!logoSrc) {
    // Return a hidden image or div matching height to prevent layout shifts
    return (
      <div
        style={{ height, width: height * 2.5, ...style }}
        className={`${className} animate-pulse bg-white/5 rounded`}
      />
    );
  }

  return (
    <img
      src={logoSrc}
      alt="Stella"
      className={className}
      style={{ ...style }}
      {...props}
    />
  );
}
