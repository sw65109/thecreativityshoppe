import type { Area } from "react-easy-crop";

export const PROFILE_AVATAR_BUCKET = "profile-avatars";

export function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "jpg") : "jpg";
}

export function getAvatarOutputType(file: File) {
  if (file.type === "image/png") {
    return { mimeType: "image/png", extension: "png" };
  }

  return { mimeType: "image/jpeg", extension: "jpg" };
}

export function getStorageAvatarPath(
  avatarUrl: string,
  bucketName = PROFILE_AVATAR_BUCKET,
) {
  if (!avatarUrl) {
    return null;
  }

  try {
    const url = new URL(avatarUrl);
    const pathPrefix = `/storage/v1/object/public/${bucketName}/`;

    if (!url.pathname.startsWith(pathPrefix)) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(pathPrefix.length));
  } catch {
    return null;
  }
}

export async function readFileAsDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not preview the selected image."));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Could not read the selected image."));
    };

    reader.readAsDataURL(file);
  });
}

async function loadImage(source: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the selected image."));
    image.src = source;
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createFlippedBand(
  sourceCanvas: HTMLCanvasElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  flipX: boolean,
  flipY: boolean,
) {
  const safeX = Math.floor(sx);
  const safeY = Math.floor(sy);
  const safeW = Math.max(1, Math.floor(sw));
  const safeH = Math.max(1, Math.floor(sh));

  const extracted = document.createElement("canvas");
  extracted.width = safeW;
  extracted.height = safeH;

  const extractedContext = extracted.getContext("2d");
  if (!extractedContext) {
    throw new Error("Could not prepare the smart fill band.");
  }

  extractedContext.drawImage(
    sourceCanvas,
    safeX,
    safeY,
    safeW,
    safeH,
    0,
    0,
    safeW,
    safeH,
  );

  const flipped = document.createElement("canvas");
  flipped.width = safeW;
  flipped.height = safeH;

  const flippedContext = flipped.getContext("2d");
  if (!flippedContext) {
    throw new Error("Could not prepare the smart fill band.");
  }

  flippedContext.save();
  flippedContext.translate(flipX ? safeW : 0, flipY ? safeH : 0);
  flippedContext.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  flippedContext.drawImage(extracted, 0, 0);
  flippedContext.restore();

  return flipped;
}

export async function createCroppedAvatarFile(
  file: File,
  croppedAreaPixels: Area,
) {
  const imageSource = await readFileAsDataUrl(file);
  const image = await loadImage(imageSource);
  const outputSize = 512;

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;

  const sourceContext = sourceCanvas.getContext("2d");
  if (!sourceContext) {
    throw new Error("Could not prepare the source avatar.");
  }

  sourceContext.drawImage(image, 0, 0);

  const cropX = Math.round(croppedAreaPixels.x);
  const cropY = Math.round(croppedAreaPixels.y);
  const cropWidth = Math.max(1, Math.round(croppedAreaPixels.width));
  const cropHeight = Math.max(1, Math.round(croppedAreaPixels.height));

  const visibleLeft = clamp(cropX, 0, image.naturalWidth);
  const visibleTop = clamp(cropY, 0, image.naturalHeight);
  const visibleRight = clamp(cropX + cropWidth, 0, image.naturalWidth);
  const visibleBottom = clamp(cropY + cropHeight, 0, image.naturalHeight);

  const visibleWidth = visibleRight - visibleLeft;
  const visibleHeight = visibleBottom - visibleTop;

  if (visibleWidth <= 0 || visibleHeight <= 0) {
    throw new Error("The selected crop area does not contain any image pixels.");
  }

  const topGap = Math.max(0, -cropY);
  const bottomGap = Math.max(0, cropY + cropHeight - image.naturalHeight);
  const leftGap = Math.max(0, -cropX);
  const rightGap = Math.max(0, cropX + cropWidth - image.naturalWidth);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const out = canvas.getContext("2d");
  if (!out) {
    throw new Error("Could not prepare the cropped avatar.");
  }

  out.fillStyle = "rgb(240, 240, 240)";
  out.fillRect(0, 0, outputSize, outputSize);

  const destX = ((visibleLeft - cropX) / cropWidth) * outputSize;
  const destY = ((visibleTop - cropY) / cropHeight) * outputSize;
  const destWidth = (visibleWidth / cropWidth) * outputSize;
  const destHeight = (visibleHeight / cropHeight) * outputSize;

  const bandHeight = Math.max(1, Math.min(24, visibleHeight));
  const bandWidth = Math.max(1, Math.min(24, visibleWidth));

  if (topGap > 0) {
    const topFillHeight = Math.round((topGap / cropHeight) * outputSize);
    const topBand = createFlippedBand(
      sourceCanvas,
      visibleLeft,
      visibleTop,
      visibleWidth,
      bandHeight,
      false,
      true,
    );

    out.drawImage(topBand, 0, 0, outputSize, topFillHeight);
  }

  if (bottomGap > 0) {
    const bottomFillHeight = Math.round((bottomGap / cropHeight) * outputSize);
    const bottomBand = createFlippedBand(
      sourceCanvas,
      visibleLeft,
      visibleBottom - bandHeight,
      visibleWidth,
      bandHeight,
      false,
      true,
    );

    out.drawImage(
      bottomBand,
      0,
      outputSize - bottomFillHeight,
      outputSize,
      bottomFillHeight,
    );
  }

  if (leftGap > 0) {
    const leftFillWidth = Math.round((leftGap / cropWidth) * outputSize);
    const leftBand = createFlippedBand(
      sourceCanvas,
      visibleLeft,
      visibleTop,
      bandWidth,
      visibleHeight,
      true,
      false,
    );

    out.drawImage(leftBand, 0, 0, leftFillWidth, outputSize);
  }

  if (rightGap > 0) {
    const rightFillWidth = Math.round((rightGap / cropWidth) * outputSize);
    const rightBand = createFlippedBand(
      sourceCanvas,
      visibleRight - bandWidth,
      visibleTop,
      bandWidth,
      visibleHeight,
      true,
      false,
    );

    out.drawImage(
      rightBand,
      outputSize - rightFillWidth,
      0,
      rightFillWidth,
      outputSize,
    );
  }

  out.drawImage(
    image,
    visibleLeft,
    visibleTop,
    visibleWidth,
    visibleHeight,
    destX,
    destY,
    destWidth,
    destHeight,
  );

  const { mimeType, extension } = getAvatarOutputType(file);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (!nextBlob) {
          reject(new Error("Could not create the cropped avatar."));
          return;
        }

        resolve(nextBlob);
      },
      mimeType,
      mimeType === "image/jpeg" ? 0.92 : undefined,
    );
  });

  return new File([blob], `avatar-${Date.now()}.${extension}`, {
    type: mimeType,
  });
}