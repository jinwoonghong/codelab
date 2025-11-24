'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, MessageCircle, Settings } from 'lucide-react'

const navItems = [
  { href: '/academic', label: 'Academic', icon: BookOpen, color: 'academic' },
  { href: '/networking', label: 'Networking', icon: MessageCircle, color: 'networking' },
  { href: '/settings', label: 'Settings', icon: Settings, color: 'gray' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const isActive = pathname.startsWith(href)

          const getColorClass = () => {
            if (!isActive) return 'text-gray-400'
            switch (color) {
              case 'academic': return 'text-academic'
              case 'networking': return 'text-networking'
              default: return 'text-gray-600'
            }
          }

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center px-4 py-2 transition-smooth ${getColorClass()}`}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
