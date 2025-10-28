"use client";
import gsap from "gsap";
import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import logo from "@/assets/images/omnia_hero_logo.webp";
import { useSafeMediaQuery } from "@/hooks/useMediaQuery";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const videos = [
  "/videos/odintsov.webm",
  "/videos/massage_spa.webm",
  "/videos/massage_face.webm",
  "/videos/tarot.webm",
];

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const { mounted: isClient, isMatch: isMobile } =
    useSafeMediaQuery("(max-width: 600px)");
  const logoRef = useRef<HTMLImageElement>(null);

  const playNextVideo = useCallback(() => {
    if (videoRef.current) {
      // Blur out current video
      gsap.to(videoRef.current, {
        filter: "blur(20px) brightness(0.4)",
        duration: 0.5,
        onComplete: () => {
          const nextIndex = (currentVideoIndex + 1) % videos.length;
          setCurrentVideoIndex(nextIndex);
          videoRef.current!.src = videos[nextIndex];
          videoRef.current!.load();
          videoRef.current!.play();

          // Blur in new video
          gsap.to(videoRef.current!, {
            filter: "blur(0px) brightness(0.4)",
            duration: 0.5,
          });
        },
      });
    }
  }, [currentVideoIndex]);

  useEffect(() => {
    const currentVideo = videoRef.current;
    if (currentVideo) {
      currentVideo.addEventListener("ended", playNextVideo);

      return () => {
        currentVideo.removeEventListener("ended", playNextVideo);
      };
    }
  }, [currentVideoIndex, playNextVideo]);

  useGSAP(() => {
    const splitText = new SplitText(".hero-logo-text", {
      type: "words",
    });

    gsap.from(logoRef.current, {
      opacity: 0,
      scale: 0.5,
      duration: 1.5,
      ease: "power2.inOut",
    });

    gsap.from(splitText.words, {
      y: 100,
      opacity: 0,
      stagger: 0.05,
      duration: 0.8,
      ease: "sine.inOut",
    });
  });

  return (
    <div
      id="home"
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="hero-video"
        style={{
          filter: "brightness(0.4)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      >
        <source src={videos[currentVideoIndex]} type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <div
        style={{
          position: "absolute",
          opacity: 0.5,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          className="hero-logo"
          ref={logoRef}
          src={logo}
          alt="logo"
          style={{
            width: isClient && isMobile ? "100%" : "50%",
            height: "auto",
            objectFit: "contain",
          }}
        />
        <p
          className="hero-logo-text"
          style={{
            color: "white",
            fontSize: isClient && isMobile ? "30px" : "50px",
            textAlign: "center",
            fontFamily: "var(--font-lora-italic)",
          }}
        >
          Centro Holístico y Desarrollo Del Ser
        </p>
      </div>
    </div>
  );
};

export default Hero;
