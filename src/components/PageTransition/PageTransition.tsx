'use client'
import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    setIsTransitioning(true)
    
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsTransitioning(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname, children])

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Page actuelle */}
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out transform-gpu ${
          isTransitioning
            ? 'opacity-0 scale-95 rotate-y-12 translate-x-8'
            : 'opacity-100 scale-100 rotate-y-0 translate-x-0'
        }`}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        }}
      >
        {displayChildren}
      </div>

      {/* Overlay de transition */}
      <div
        className={`absolute inset-0 w-full h-full bg-gradient-to-r from-blue-50/80 via-white/90 to-green-50/80 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          isTransitioning
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-110 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(34, 197, 94, 0.1) 100%)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>

      <style jsx>{`
        .rotate-y-12 {
          transform: perspective(1000px) rotateY(12deg) translateX(20px) scale(0.95);
        }
        .rotate-y-0 {
          transform: perspective(1000px) rotateY(0deg) translateX(0px) scale(1);
        }
      `}</style>
    </div>
  )
}
