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
  speed?: number;
  tags?: {
    name: string;
    icon?: React.ReactNode;
  }[];
  classNameCarousel?: string;
}

// Extracted styles
const carouselStyles = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "row" as const,
    height: "100%",
    overflow: "hidden",
  },
  marqueeContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row" as const,
    gap: "16px",
    height: "100%",
  },
  image: (isMobile: boolean) => ({
    width: isMobile ? "300px" : "450px",
    height: isMobile ? "200px" : "300px",
    objectFit: "cover" as const,
    borderRadius: "16px",
    flexShrink: 0,
  }),
  tagContainer: {
    width: "100px",
    height: "100px",
    objectFit: "cover" as const,
    borderRadius: "16px",
    backgroundColor: "#B09172",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
  },
  tagText: {
    color: "#fff",
    fontSize: "14px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "10px 10px",
    borderRadius: "20px",
    marginTop: "10px",
    fontFamily: "var(--font-cabinet-grotesk)",
    width: "85%",
    textAlign: "center" as const,
  },
};

// Reusable components
const CarouselImage = ({
  image,
  altText,
  index,
  isMobile,
}: {
  image: string;
  altText: string;
  index: number;
  isMobile: boolean;
}) => (
  <Image
    key={index}
    src={image}
    alt={`${altText} ${index + 1}`}
    width={isMobile ? 300 : 450}
    height={isMobile ? 200 : 300}
    style={carouselStyles.image(isMobile)}
  />
);

const CarouselTag = ({
  tag,
  index,
  isDuplicate = false,
}: {
  tag: { name: string; icon?: React.ReactNode };
  index: number;
  isDuplicate?: boolean;
}) => (
  <div
    key={isDuplicate ? `duplicate-${index}` : index}
    style={carouselStyles.tagContainer}
  >
    {tag.icon}
    <span style={carouselStyles.tagText}>{tag.name}</span>
  </div>
);

export const ImageCarousel = ({
  isMobile = false,
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

    // Calculate dimensions
    const elementWidth = firstElement.offsetWidth;
    const gap = 16;
    const totalWidth =
      (elementWidth + gap) * (images?.length || tags?.length || 0);

    if (totalWidth === 0) return;

    // Create animation
    const tl = gsap.timeline({ repeat: -1 });

    if (direction === "right") {
      tl.set(container, { x: -totalWidth }).to(container, {
        x: 0,
        duration: speed,
        ease: "none",
      });
    } else {
      tl.to(container, {
        x: -totalWidth,
        duration: speed,
        ease: "none",
      });
    }

    animationRef.current = tl;

    return () => {
      animationRef.current?.kill();
    };
  }, [autoPlay, images?.length, tags?.length, direction, speed]);

  const renderImages = () => {
    if (!images?.length) return null;

    return (
      <>
        {images.map((image, index) => (
          <CarouselImage
            key={index}
            image={image}
            altText={altText}
            index={index}
            isMobile={isMobile}
          />
        ))}
        {/* Duplicate for seamless loop */}
        {images.map((image, index) => (
          <CarouselImage
            key={`duplicate-${index}`}
            image={image}
            altText={altText}
            index={index}
            isMobile={isMobile}
          />
        ))}
      </>
    );
  };

  const renderTags = () => {
    if (!tags?.length) return null;

    return (
      <>
        {tags.map((tag, index) => (
          <CarouselTag key={index} tag={tag} index={index} />
        ))}
        {/* Multiple duplicates for seamless loop */}
        {tags.map((tag, index) => (
          <CarouselTag
            key={`duplicate-1-${index}`}
            tag={tag}
            index={index}
            isDuplicate
          />
        ))}
        {tags.map((tag, index) => (
          <CarouselTag
            key={`duplicate-2-${index}`}
            tag={tag}
            index={index}
            isDuplicate
          />
        ))}
        {tags.map((tag, index) => (
          <CarouselTag
            key={`duplicate-3-${index}`}
            tag={tag}
            index={index}
            isDuplicate
          />
        ))}
      </>
    );
  };

  return (
    <div
      className={`image-carousel ${classNameCarousel || ""}`}
      style={carouselStyles.container}
    >
      <div ref={containerRef} style={carouselStyles.marqueeContainer}>
        {renderImages()}
        {renderTags()}
      </div>
    </div>
  );
};
