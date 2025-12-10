"use client"

import { motion, useAnimation } from "framer-motion"

interface ShoppingCartIconProps {
  size?: number
  className?: string
}

export function ShoppingCartIcon({ size = 48, className = "" }: ShoppingCartIconProps) {
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
      {/* Cart body */}
      <motion.path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" variants={draw} custom={0} />

      {/* Left wheel */}
      <motion.circle cx="9" cy="21" r="1.5" variants={pop} custom={0.6} />

      {/* Right wheel */}
      <motion.circle cx="20" cy="21" r="1.5" variants={pop} custom={0.8} />
    </motion.svg>
  )
}
