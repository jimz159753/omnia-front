"use client"

import { motion, useAnimation } from "framer-motion"

interface ServicesIconProps {
  size?: number
  className?: string
}

export function ServicesIcon({ size = 24, className = "" }: ServicesIconProps) {
  const controls = useAnimation()

  const handleHover = async () => {
    // Reset to hidden state quickly
    await controls.start("hidden")
    // Animate drawing
    controls.start("visible")
  }

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (delay: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          delay,
          type: "spring",
          duration: 1.2,
          bounce: 0,
        },
        opacity: { delay, duration: 0.01 },
      },
    }),
  }

  const pop = {
    hidden: { scale: 0, opacity: 0 },
    visible: (delay: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay,
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    }),
  }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ cursor: "pointer" }}
      initial="visible"
      animate={controls}
      onMouseEnter={handleHover}
    >
      {/* Top-left panel */}
      <motion.rect x="3" y="3" width="7" height="7" rx="1.5" variants={draw} custom={0} />
      {/* Top-right panel */}
      <motion.rect x="14" y="3" width="7" height="7" rx="1.5" variants={draw} custom={0.15} />
      {/* Bottom-left panel */}
      <motion.rect x="3" y="14" width="7" height="7" rx="1.5" variants={draw} custom={0.3} />
      {/* Bottom-right panel */}
      <motion.rect x="14" y="14" width="7" height="7" rx="1.5" variants={draw} custom={0.45} />

      {/* Dots that pop in after panels draw */}
      <motion.circle cx="6.5" cy="6.5" r="1" fill="currentColor" stroke="none" variants={pop} custom={0.6} />
      <motion.circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" variants={pop} custom={0.7} />
      <motion.circle cx="6.5" cy="17.5" r="1" fill="currentColor" stroke="none" variants={pop} custom={0.8} />
      <motion.circle cx="17.5" cy="17.5" r="1" fill="currentColor" stroke="none" variants={pop} custom={0.9} />
    </motion.svg>
  )
}
