export const drawImageScaled = (img: HTMLImageElement, ctx: CanvasRenderingContext2D) => {
   const canvas = ctx.canvas;
   const hRatio = canvas.width / img.width;
   const vRatio = canvas.height / img.height;
   const ratio = Math.min(hRatio, vRatio);
   const centerShift_x = (canvas.width - img.width * ratio) / 2;
   const centerShift_y = (canvas.height - img.height * ratio) / 2;
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.drawImage(img, 0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
};

export const getMaskDataUrl = (imageCanvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement): string => {
  // For OpenCV, we just need the mask layer itself as an image.
  // The maskCanvas already contains the strokes on a transparent background.
  // We can return it directly.
  return maskCanvas.toDataURL('image/png');
};