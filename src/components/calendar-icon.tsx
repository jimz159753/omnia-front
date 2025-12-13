"use client"

import { motion, useAnimation } from "framer-motion"

interface CalendarIconProps {
  size?: number
  className?: string
}

export function CalendarIcon({ size = 48, className = "" }: CalendarIconProps) {
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
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ cursor: "pointer" }}
      initial="visible"
      animate={controls}
      onMouseEnter={handleHover}
    >
      {/* Calendar body */}
      <motion.rect x="3" y="4" width="18" height="18" rx="2" ry="2" variants={draw} custom={0} />

      {/* Top line */}
      <motion.line x1="3" y1="10" x2="21" y2="10" variants={draw} custom={0.3} />

      {/* Left hook */}
      <motion.line x1="8" y1="2" x2="8" y2="6" variants={draw} custom={0.5} />

      {/* Right hook */}
      <motion.line x1="16" y1="2" x2="16" y2="6" variants={draw} custom={0.6} />

      {/* Calendar dots - first row */}
      <motion.circle cx="7" cy="14" r="0.5" fill="currentColor" variants={pop} custom={0.8} />
      <motion.circle cx="12" cy="14" r="0.5" fill="currentColor" variants={pop} custom={0.85} />
      <motion.circle cx="17" cy="14" r="0.5" fill="currentColor" variants={pop} custom={0.9} />

      {/* Calendar dots - second row */}
      <motion.circle cx="7" cy="18" r="0.5" fill="currentColor" variants={pop} custom={0.95} />
      <motion.circle cx="12" cy="18" r="0.5" fill="currentColor" variants={pop} custom={1.0} />
      <motion.circle cx="17" cy="18" r="0.5" fill="currentColor" variants={pop} custom={1.05} />
    </motion.svg>
  )
}
