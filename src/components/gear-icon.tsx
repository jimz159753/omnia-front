"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface GearIconProps {
  size?: number
  className?: string
}

export function GearIcon({ size = 24, className = "" }: GearIconProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.g
        animate={{
          rotate: isHovered ? 360 : 0,
        }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{ transformOrigin: "center" }}
      >
        <motion.path
          d="M12 1.5C12.6 1.5 13.1 1.9 13.2 2.5L13.5 4.2C14.3 4.4 15 4.8 15.6 5.2L17.2 4.4C17.7 4.1 18.4 4.2 18.8 4.7L19.3 5.2C19.7 5.6 19.8 6.3 19.6 6.8L18.8 8.4C19.2 9 19.6 9.7 19.8 10.5L21.5 10.8C22.1 10.9 22.5 11.4 22.5 12C22.5 12.6 22.1 13.1 21.5 13.2L19.8 13.5C19.6 14.3 19.2 15 18.8 15.6L19.6 17.2C19.9 17.7 19.8 18.4 19.3 18.8L18.8 19.3C18.4 19.7 17.7 19.8 17.2 19.6L15.6 18.8C15 19.2 14.3 19.6 13.5 19.8L13.2 21.5C13.1 22.1 12.6 22.5 12 22.5C11.4 22.5 10.9 22.1 10.8 21.5L10.5 19.8C9.7 19.6 9 19.2 8.4 18.8L6.8 19.6C6.3 19.9 5.6 19.8 5.2 19.3L4.7 18.8C4.3 18.4 4.2 17.7 4.4 17.2L5.2 15.6C4.8 15 4.4 14.3 4.2 13.5L2.5 13.2C1.9 13.1 1.5 12.6 1.5 12C1.5 11.4 1.9 10.9 2.5 10.8L4.2 10.5C4.4 9.7 4.8 9 5.2 8.4L4.4 6.8C4.1 6.3 4.2 5.6 4.7 5.2L5.2 4.7C5.6 4.3 6.3 4.2 6.8 4.4L8.4 5.2C9 4.8 9.7 4.4 10.5 4.2L10.8 2.5C10.9 1.9 11.4 1.5 12 1.5Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <motion.circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.5} fill="none" />
      </motion.g>
    </motion.svg>
  )
}
