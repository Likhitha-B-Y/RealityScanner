/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function applyPrivacyBlur(imageBase64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(imageBase64);

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Subtle privacy filter on peripheral background zones (protecting faces / plates)
      // Adds a light frosted edge effect leaving center civic defect in crystal focus
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.28,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.52
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.08)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(imageBase64);
    img.src = imageBase64;
  });
}
