"use client"

import { motion, useAnimation } from "framer-motion"

export function HomeIcon({
  className = "",
  size = 48,
}: {
  className?: string
  size?: number
}) {
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
          duration: 1.5,
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
      xmlns="http://www.w3.org/2000/svg"
      className={`cursor-pointer ${className}`}
      initial="visible"
      animate={controls}
      onMouseEnter={handleHover}
    >
      <motion.path
        d="M3 11L12 3L21 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={draw}
        custom={0}
      />

      <motion.path
        d="M5 10V19C5 19.5523 5.44772 20 6 20H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={draw}
        custom={0.3}
      />

      <motion.path
        d="M19 10V19C19 19.5523 18.5523 20 18 20H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={draw}
        custom={0.3}
      />

      <motion.path
        d="M9 20V14H15V20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={draw}
        custom={0.6}
      />

      <motion.circle
        cx="13.5"
        cy="17"
        r="0.75"
        fill="currentColor"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { delay: 1.2, duration: 0.3, type: "spring" },
          },
        }}
      />
    </motion.svg>
  )
}
