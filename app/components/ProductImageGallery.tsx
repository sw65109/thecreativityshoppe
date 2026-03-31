"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductImageGalleryProps = {
  name: string;
  images: string[];
};

export default function ProductImageGallery({
  name,
  images,
}: ProductImageGalleryProps) {
  const galleryImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!galleryImages.length) {
    return (
      <div className="rounded-3xl bg-driftwood p-8 text-center text-walnut">
        No product images available.
      </div>
    );
  }

  const safeActiveIndex = Math.min(activeIndex, galleryImages.length - 1);
  const hasMultipleImages = galleryImages.length > 1;
  const activeImage = galleryImages[safeActiveIndex];

  function showPrevious() {
    setActiveIndex((current) => {
      const base = Math.min(current, galleryImages.length - 1);
      return base === 0 ? galleryImages.length - 1 : base - 1;
    });
  }

  function showNext() {
    setActiveIndex((current) => {
      const base = Math.min(current, galleryImages.length - 1);
      return base === galleryImages.length - 1 ? 0 : base + 1;
    });
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      <div className="flex gap-3 overflow-x-auto lg:max-h-130 lg:w-28 lg:flex-col">
        {galleryImages.map((image, index) => {
          const isActive = index === safeActiveIndex;

          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border transition ${
                isActive
                  ? "border-background shadow-lg"
                  : "border-background/15 opacity-75 hover:opacity-100"
              }`}
              aria-label={`Show image ${index + 1} of ${galleryImages.length}`}
            >
              <Image
                src={image}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                sizes="96px"
                loading="eager"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      <div className="relative min-h-105 flex-1 overflow-hidden rounded-3xl bg-driftwood">
        <Image
          src={activeImage}
          alt={name}
          fill
          loading="eager"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous image"
              className="absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-sandstone shadow-md transition hover:bg-background"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label="Next image"
              className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-sandstone shadow-md transition hover:bg-background"
            >
              <ChevronRight className="" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-background/75 px-4 py-2 text-sm font-medium text-sandstone">
              <span>
                {safeActiveIndex + 1} / {galleryImages.length}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}