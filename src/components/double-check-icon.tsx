"use client"

import { useAnimation, motion } from "framer-motion"

interface DoubleCheckIconProps {
  size?: number
  className?: string
}

export function DoubleCheckIcon({ size = 48, className = "" }: DoubleCheckIconProps) {
  const controls = useAnimation()

  const handleHover = async () => {
    // Reset to hidden state quickly
    await controls.start({
      pathLength: 0,
      opacity: 1,
      transition: { duration: 0.1 },
    })

    // Animate first check
    await controls.start((i) => ({
      pathLength: 1,
      transition: {
        duration: 0.4,
        delay: i * 0.15,
        ease: [0.65, 0, 0.35, 1],
      },
    }))
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
      onHoverStart={handleHover}
      style={{ cursor: "pointer" }}
    >
      {/* First check (back) */}
      <motion.path d="M3 12l5 5L18 7" initial={{ pathLength: 1, opacity: 1 }} animate={controls} custom={0} />

      {/* Second check (front) */}
      <motion.path d="M8 12l5 5L23 7" initial={{ pathLength: 1, opacity: 1 }} animate={controls} custom={1} />
    </motion.svg>
  )
}
