"use client"

import { motion, useAnimation } from "framer-motion"

interface ClientsIconProps {
  size?: number
  className?: string
}

export function ClientsIcon({ size = 48, className = "" }: ClientsIconProps) {
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
      {/* First person (left) - head */}
      <motion.circle cx="9" cy="7" r="3" variants={draw} custom={0} />

      {/* First person (left) - body */}
      <motion.path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" variants={draw} custom={0.3} />

      {/* Second person (right) - head */}
      <motion.circle cx="17" cy="7" r="3" variants={draw} custom={0.5} />

      {/* Second person (right) - body */}
      <motion.path d="M22 21v-2a4 4 0 0 0-3-3.87" variants={draw} custom={0.7} />
    </motion.svg>
  )
}
