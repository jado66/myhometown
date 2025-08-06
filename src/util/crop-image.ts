// lib/crop-image.ts
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // important for CORS
    image.src = url;
  });

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<{ blob: Blob | null; dataUrl: string }> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2D context available");
  }

  const rotationInRads = (rotation * Math.PI) / 180;

  // calculate bounding box of the rotated image
  const sWidth = image.naturalWidth;
  const sHeight = image.naturalHeight;

  const cos = Math.cos(rotationInRads);
  const sin = Math.sin(rotationInRads);

  const x1 = -sWidth / 2;
  const y1 = -sHeight / 2;
  const x2 = sWidth / 2;
  const y2 = sHeight / 2;

  const rotatedX1 = x1 * cos - y1 * sin;
  const rotatedY1 = x1 * sin + y1 * cos;
  const rotatedX2 = x2 * cos - y1 * sin;
  const rotatedY2 = x2 * sin + y1 * cos;
  const rotatedX3 = x1 * cos - y2 * sin;
  const rotatedY3 = x1 * sin + y2 * cos;
  const rotatedX4 = x2 * cos - y2 * sin;
  const rotatedY4 = x2 * sin + y2 * cos;

  const minX = Math.min(rotatedX1, rotatedX2, rotatedX3, rotatedX4);
  const minY = Math.min(rotatedY1, rotatedY2, rotatedY3, rotatedY4);
  const maxX = Math.max(rotatedX1, rotatedX2, rotatedX3, rotatedX4);
  const maxY = Math.max(rotatedY1, rotatedY2, rotatedY3, rotatedX4);

  const rotatedWidth = maxX - minX;
  const rotatedHeight = maxY - minY;

  // set canvas size to match the bounding box of the rotated image
  canvas.width = rotatedWidth;
  canvas.height = rotatedHeight;

  // translate canvas context to the center of the rotated image
  ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
  ctx.rotate(rotationInRads);
  ctx.drawImage(image, -sWidth / 2, -sHeight / 2, sWidth, sHeight);

  // get the cropped image data
  const data = ctx.getImageData(
    pixelCrop.x + (rotatedWidth - sWidth) / 2, // Adjust for translation
    pixelCrop.y + (rotatedHeight - sHeight) / 2, // Adjust for translation
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas to the size of the cropped image
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // draw the cropped image onto the new canvas
  ctx.putImageData(data, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve({ blob, dataUrl: canvas.toDataURL("image/webp") });
      },
      "image/webp",
      0.8
    ); // Convert to WebP with 80% quality
  });
};
