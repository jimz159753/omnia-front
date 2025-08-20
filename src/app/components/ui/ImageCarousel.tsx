"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";

interface ImageCarouselProps {
  isMobile?: boolean;
  images?: string[];
  altText?: string;
  autoPlay?: boolean;
  direction?: "left" | "right";
  speed?: number; // Duration in seconds
  tags?: {
    name: string;
    icon: React.ReactNode;
  }[];
  classNameCarousel?: string;
}

export const ImageCarousel = ({
  isMobile,
  images,
  altText = "carousel image",
  autoPlay = true,
  direction = "left",
  speed = 15,
  tags,
  classNameCarousel,
}: ImageCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!autoPlay || !containerRef.current) return;

    const container = containerRef.current;
    const firstElement = container.firstElementChild as HTMLElement;
    if (!firstElement) return;

    // Calculate width based on images or tags
    let elementWidth: number;
    let gap: number;
    let totalWidth: number;

    if (images && images.length > 0) {
      // If we have images, calculate based on image width
      elementWidth = firstElement.offsetWidth;
      gap = 16; // 4 * 4px (gap-4)
      totalWidth = (elementWidth + gap) * images.length;
    } else if (tags && tags.length > 0) {
      // If we only have tags, calculate based on tag width
      elementWidth = firstElement.offsetWidth;
      gap = 16; // 4 * 4px (gap-4)
      totalWidth = (elementWidth + gap) * tags.length;
    } else {
      return; // No content to animate
    }

    // Create infinite loop animation
    const tl = gsap.timeline({ repeat: -1 });

    // Set direction based on prop and ensure infinite loop
    if (direction === "right") {
      // For right direction, start from negative position and move to positive
      tl.set(container, { x: -totalWidth }).to(container, {
        x: 0,
        duration: speed,
        ease: "none",
      });
    } else {
      // For left direction (default), move from 0 to negative
      tl.to(container, {
        x: -totalWidth,
        duration: speed,
        ease: "none",
      });
    }

    animationRef.current = tl;

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [autoPlay, images?.length, tags?.length, direction, speed]);

  return (
    <div
      className={`image-carousel ${classNameCarousel}`}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Marquee Container */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          height: "100%",
        }}
      >
        {images?.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt={`${altText} ${index + 1}`}
            width={isMobile ? 300 : 450}
            height={isMobile ? 200 : 300}
            unoptimized
            style={{
              width: isMobile ? "300px" : "450px",
              height: isMobile ? "200px" : "300px",
              objectFit: "cover",
              borderRadius: "16px",
              flexShrink: 0,
            }}
          />
        ))}
        {/* Duplicate images for seamless loop */}
        {images?.map((image, index) => (
          <Image
            key={`duplicate-${index}`}
            src={image}
            alt={`${altText} ${index + 1}`}
            width={isMobile ? 300 : 450}
            height={isMobile ? 200 : 300}
            unoptimized
            style={{
              width: isMobile ? "300px" : "450px",
              height: isMobile ? "200px" : "300px",
              objectFit: "cover",
              borderRadius: "16px",
              flexShrink: 0,
            }}
          />
        ))}
        {tags?.map((tag, index) => (
          <div
            key={index}
            className="tag-item flex items-center gap-2 bg-black-100 text-white px-4 py-2 rounded-full flex-shrink-0 min-w-fit"
          >
            {tag.icon}
            <span className="font-medium whitespace-nowrap text-gray-400">
              {tag.name}
            </span>
          </div>
        ))}
        {/* Duplicate tags multiple times for seamless infinite loop */}
        {tags?.map((tag, index) => (
          <div
            key={`duplicate-1-${index}`}
            className="tag-item flex items-center gap-2 bg-black-100 text-white px-4 py-2 rounded-full flex-shrink-0 min-w-fit"
          >
            {tag.icon}
            <span className="font-medium whitespace-nowrap text-gray-400">
              {tag.name}
            </span>
          </div>
        ))}
        {tags?.map((tag, index) => (
          <div
            key={`duplicate-2-${index}`}
            className="tag-item flex items-center gap-2 bg-black-100 text-white px-4 py-2 rounded-full flex-shrink-0 min-w-fit"
          >
            {tag.icon}
            <span className="font-medium whitespace-nowrap text-gray-400">
              {tag.name}
            </span>
          </div>
        ))}
        {tags?.map((tag, index) => (
          <div
            key={`duplicate-3-${index}`}
            className="tag-item flex items-center gap-2 bg-black-100 text-white px-4 py-2 rounded-full flex-shrink-0 min-w-fit"
          >
            {tag.icon}
            <span className="font-medium whitespace-nowrap text-gray-400">
              {tag.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
