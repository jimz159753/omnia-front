"use client";

import { useMediaQuery, useTheme } from "@/hooks/useCustomMediaQuery";
import { ChevronLeft, ChevronRight } from "akar-icons";
import Image from "next/image";
import React, { useState } from "react";

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No images to display</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="relative flex justify-center items-center">
        {/* Main Image Container */}
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          <Image
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            width={isMobile ? 500 : 800}
            height={isMobile ? 500 : 800}
            className="w-[600px] h-full object-cover select-none"
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <ChevronLeft
                className="absolute top-1/2 text-white p-2 rounded-full z-10 cursor-pointer"
                style={{
                  left: "15px",
                }}
                onClick={goToPrevious}
                color="black"
                size={40}
              />

              <ChevronRight
                className="absolute top-1/2 text-white p-2 rounded-full z-10 cursor-pointer"
                style={{
                  right: "15px",
                }}
                onClick={goToNext}
                color="black"
                size={40}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
