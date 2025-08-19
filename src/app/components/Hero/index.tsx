"use client";
import gsap from "gsap";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import logo from "@/assets/images/omnia_hero_logo.webp";
import useMediaQuery from "@mui/material/useMediaQuery";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const videos = [
    "/videos/massage_spa.webm",
    "/videos/massage_face.webm",
    "/videos/odintsov.webm",
  ];

  const playNextVideo = () => {
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
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("ended", playNextVideo);
      videoRef.current.addEventListener("error", (e) => {
        console.error("Video error:", e);
      });
      videoRef.current.addEventListener("loadstart", () => {
        console.log("Video loading started");
      });
      videoRef.current.addEventListener("canplay", () => {
        console.log("Video can play");
      });

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("ended", playNextVideo);
          videoRef.current.removeEventListener("error", (e) => {
            console.error("Video error:", e);
          });
          videoRef.current.removeEventListener("loadstart", () => {
            console.log("Video loading started");
          });
          videoRef.current.removeEventListener("canplay", () => {
            console.log("Video can play");
          });
        }
      };
    }
  }, [currentVideoIndex]);

  return (
    <div
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
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src={logo}
          alt="logo"
          style={{
            width: isMobile ? "100%" : "70%",
            height: "auto",
            objectFit: "contain",
          }}
        />
        <p
          style={{
            color: "white",
            fontSize: isMobile ? "30px" : "40px",
            textAlign: "center",
            fontFamily: "var(--font-bigilla)",
          }}
        >
          Centro Holístico y Desarrollo Del Ser
        </p>
      </div>
    </div>
  );
};

export default Hero;
