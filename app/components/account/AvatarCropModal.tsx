"use client";

import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

type AvatarCropModalProps = {
  imageSrc: string;
  isOpen: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: (croppedAreaPixels: Area) => Promise<void> | void;
};

export default function AvatarCropModal({
  imageSrc,
  isOpen,
  isSaving,
  onCancel,
  onConfirm,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-background/20 bg-sandstone p-6 text-background shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">Crop Profile Photo</h3>
            <p className="mt-2 text-background/70">
              Drag the image and adjust zoom until the avatar looks right.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-xl border border-background/15 px-4 py-2 transition hover:bg-background hover:text-sandstone disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <div className="relative mt-6 h-90 overflow-hidden rounded-2xl border border-background/15 bg-background/10">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            minZoom={1.15}
            maxZoom={4}
            restrictPosition={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_croppedArea, nextCroppedAreaPixels) => {
              setCroppedAreaPixels(nextCroppedAreaPixels);
            }}
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-background/75">
            Zoom
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="mt-2 w-full accent-background"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-xl border border-background/15 px-5 py-3 transition hover:bg-background hover:text-sandstone disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!croppedAreaPixels || isSaving}
            onClick={() => {
              if (!croppedAreaPixels) {
                return;
              }

              void onConfirm(croppedAreaPixels);
            }}
            className="rounded-xl border border-background/15 bg-background px-5 py-3 font-semibold text-sandstone transition hover:opacity-90 disabled:opacity-60"
          >
            {isSaving ? "Applying Crop..." : "Use Cropped Photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
