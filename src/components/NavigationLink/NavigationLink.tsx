'use client'
import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NavigationLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function NavigationLink({ href, children, className = '', onClick }: NavigationLinkProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Trigger page transition effect
    document.body.style.overflow = 'hidden'
    
    // Add transition class to body
    document.body.classList.add('page-transitioning')
    
    // Execute custom onClick if provided
    if (onClick) {
      onClick()
    }
    
    // Navigate after a short delay for smooth transition
    setTimeout(() => {
      router.push(href)
      
      // Remove transition class after navigation
      setTimeout(() => {
        document.body.classList.remove('page-transitioning')
        document.body.style.overflow = 'auto'
      }, 100)
    }, 150)
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
