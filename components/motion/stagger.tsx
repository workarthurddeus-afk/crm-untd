'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'

const parentVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,  // 40ms between each child
      delayChildren: 0,
    },
  },
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0, 0, 0.2, 1],
    },
  },
}

interface StaggerListProps {
  children: React.ReactNode
  className?: string
}

export function StaggerList({ children, className }: StaggerListProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={parentVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  )
}
