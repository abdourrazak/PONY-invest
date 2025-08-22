'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SupportFloat() {
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()

  const handleSupportClick = () => {
    router.push('/support')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div 
        className="relative cursor-pointer hover:scale-105 transition-transform duration-200"
        onClick={handleSupportClick}
      >
        <Image
          src="/src/public/online-support--v1.png"
          alt="Support en ligne"
          width={50}
          height={50}
          className="rounded-full shadow-lg"
        />
        
        {/* Animation pulse pour attirer l'attention */}
        <div className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping"></div>
      </div>
    </div>
  )
}
