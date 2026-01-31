import { AppMode } from "../types";

// Declare global cv variable injected by the script tag
declare const cv: any;

export const processWithOpenCV = async (
  originalImageBase64: string,
  maskDataUrl: string | null,
  mode: AppMode
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 1. Check if OpenCV is loaded
    if (typeof cv === 'undefined' || !cv.Mat) {
      reject(new Error("OpenCV is still loading. Please wait a moment and try again."));
      return;
    }

    if (!maskDataUrl && mode === AppMode.OBJECT_REMOVAL) {
      reject(new Error("No mask provided for processing."));
      return;
    }

    // 2. Load Images
    const imgElement = new Image();
    const maskElement = new Image();
    
    imgElement.src = originalImageBase64;
    
    imgElement.onload = () => {
      if (mode === AppMode.TEXT_REMOVAL && !maskDataUrl) {
         reject(new Error("Auto-text detection requires AI. Please use the Brush tool to manually select text for algorithmic removal."));
         return;
      }

      maskElement.src = maskDataUrl || '';
      maskElement.onload = () => {
        let src: any = null;
        let mask: any = null;
        let dst: any = null;
        let maskGray: any = null;
        let srcRGB: any = null;

        try {
          // 3. Create Mats (Matrices)
          src = cv.imread(imgElement);
          mask = cv.imread(maskElement);
          dst = new cv.Mat();
          maskGray = new cv.Mat();

          // 4. Handle Resolution Mismatch
          // The mask (from canvas) might be smaller than the original high-res image.
          // We must resize the mask to match the source image exactly.
          if (mask.cols !== src.cols || mask.rows !== src.rows) {
             let newMask = new cv.Mat();
             let dsize = new cv.Size(src.cols, src.rows);
             // Resize the mask up to source resolution
             cv.resize(mask, newMask, dsize, 0, 0, cv.INTER_LINEAR);
             mask.delete(); // Free the old mismatched mask
             mask = newMask; // Point to the new correct mask
          }

          // 5. Prepare Source (Convert RGBA to RGB)
          // cv.inpaint expects 8-bit 1-channel or 3-channel input. 
          // Browser imread creates RGBA (4 channels) which causes errors in inpaint.
          srcRGB = new cv.Mat();
          cv.cvtColor(src, srcRGB, cv.COLOR_RGBA2RGB, 0);

          // 6. Prepare Mask (Convert to Grayscale 1-channel)
          cv.cvtColor(mask, maskGray, cv.COLOR_RGBA2GRAY, 0);
          
          // Threshold to ensure binary mask (white = remove, black = keep)
          cv.threshold(maskGray, maskGray, 10, 255, cv.THRESH_BINARY);

          // 7. Perform Inpainting
          // 3 = radius of neighborhood
          // cv.INPAINT_TELEA = Fast Marching Method
          cv.inpaint(srcRGB, maskGray, dst, 3, cv.INPAINT_TELEA);

          // 8. Output Result
          const outputCanvas = document.createElement('canvas');
          cv.imshow(outputCanvas, dst);
          const resultUrl = outputCanvas.toDataURL('image/jpeg', 0.95);

          resolve(resultUrl);
        } catch (e: any) {
          // OpenCV sometimes throws integers or strings directly
          let msg = "Unknown OpenCV error";
          if (typeof e === "number") {
             msg = "OpenCV Error Code: " + e;
          } else if (typeof e === "string") {
             msg = e;
          } else if (e instanceof Error) {
             msg = e.message;
          }
          console.error("OpenCV processing error:", e);
          reject(new Error("OpenCV Processing Failed: " + msg));
        } finally {
          // 9. Cleanup Memory (Critical for WebAssembly performance)
          if (src) src.delete();
          if (mask) mask.delete();
          if (dst) dst.delete();
          if (maskGray) maskGray.delete();
          if (srcRGB) srcRGB.delete();
        }
      };
    };
    
    imgElement.onerror = () => reject(new Error("Failed to load source image"));
    maskElement.onerror = () => reject(new Error("Failed to load mask image"));
  });
};