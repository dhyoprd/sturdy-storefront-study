"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useDialogFocus } from "@/hooks/useDialogFocus";

type EditorialGalleryProps = {
  images: string[];
  alt: string;
  fallback?: string;
  className?: string;
  countClassName?: string;
  loading?: "eager" | "lazy";
  testId?: string;
};

export default function EditorialGallery({
  images,
  alt,
  fallback,
  className,
  countClassName,
  loading = "lazy",
  testId = "editorial-gallery",
}: EditorialGalleryProps) {
  const gallery = images.length > 0 ? images : fallback ? [fallback] : [];
  const total = gallery.length;

  const [open, setOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setGridOpen(false);
    setIndex(0);
  }, []);

  useBodyScrollLock(open);
  useDialogFocus(open, dialogRef, close);

  useEffect(() => {
    if (!open || gridOpen || total < 2) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setIndex((current) => (current - 1 + total) % total);
      } else if (event.key === "ArrowRight") {
        setIndex((current) => (current + 1) % total);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gridOpen, open, total]);

  const showImage = (next: number) => {
    setIndex(((next % total) + total) % total);
  };

  return (
    <div
      className={["editorial-gallery", className].filter(Boolean).join(" ")}
      data-testid={testId}
      data-open={open}
    >
      {total > 0 ? (
        <button
          type="button"
          className="editorial-gallery__open"
          aria-label={`Open ${alt} gallery`}
          aria-haspopup="dialog"
          data-testid={`${testId}-open`}
          onClick={() => {
            setGridOpen(false);
            setOpen(true);
          }}
        >
          <img
            className="editorial-gallery__image"
            src={gallery[index]}
            alt={alt}
            loading={loading}
          />
        </button>
      ) : null}

      {total > 1 ? (
        <>
          <button
            type="button"
            className="editorial-gallery__view-all"
            aria-haspopup="dialog"
            aria-label={`View all ${total} images`}
            data-testid={`${testId}-view-all`}
            onClick={() => {
              setGridOpen(true);
              setOpen(true);
            }}
          >
            View All
          </button>
          <span
            className={["editorial-gallery__count", countClassName].filter(Boolean).join(" ")}
            data-testid={`${testId}-count`}
          >{`${index + 1} / ${total}`}</span>
        </>
      ) : null}

      {open && total > 0 ? (
        <div
          ref={dialogRef}
          className="editorial-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} gallery`}
          data-testid={`${testId}-lightbox`}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="editorial-lightbox__bar">
            <button
              type="button"
              className="editorial-lightbox__toggle"
              onClick={() => setGridOpen((current) => !current)}
            >
              {gridOpen ? "View Image" : "View All"}
            </button>
            <button
              type="button"
              className="editorial-lightbox__close"
              aria-label="Close gallery"
              onClick={close}
            >
              ×
            </button>
          </div>

          {gridOpen ? (
            <div className="editorial-lightbox__grid">
              {gallery.map((src, imageIndex) => (
                <button
                  key={`${src}-${imageIndex}`}
                  type="button"
                  className="editorial-lightbox__thumb"
                  aria-label={`View image ${imageIndex + 1}`}
                  aria-current={imageIndex === index ? "true" : undefined}
                  data-testid={`${testId}-thumb-${imageIndex + 1}`}
                  onClick={() => {
                    setIndex(imageIndex);
                    setGridOpen(false);
                  }}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          ) : (
            <>
              <img
                className="editorial-lightbox__image"
                src={gallery[index]}
                alt={`${alt} ${index + 1}`}
              />
              {total > 1 ? (
                <>
                  <button
                    type="button"
                    className="editorial-lightbox__nav editorial-lightbox__nav--prev"
                    aria-label="Previous image"
                    onClick={() => showImage(index - 1)}
                  />
                  <button
                    type="button"
                    className="editorial-lightbox__nav editorial-lightbox__nav--next"
                    aria-label="Next image"
                    onClick={() => showImage(index + 1)}
                  />
                  <span className="editorial-lightbox__counter">{`${index + 1} / ${total}`}</span>
                </>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
