"use client"

import { motion, useAnimation } from "framer-motion"

interface ChartIconProps {
  size?: number
  className?: string
}

export function ChartIcon({ size = 48, className = "" }: ChartIconProps) {
  const controls = useAnimation()

  const handleHover = async () => {
    await controls.start("hidden")
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
      {/* Horizontal axis */}
      <motion.path d="M3 3v18h18" variants={draw} custom={0} />

      {/* Bar 1 (shortest) */}
      <motion.path d="M7 21V15" variants={draw} custom={0.2} />

      {/* Bar 2 (medium) */}
      <motion.path d="M11 21V11" variants={draw} custom={0.35} />

      {/* Bar 3 (tall) */}
      <motion.path d="M15 21V7" variants={draw} custom={0.5} />

      {/* Bar 4 (tallest) */}
      <motion.path d="M19 21V4" variants={draw} custom={0.65} />
    </motion.svg>
  )
}
