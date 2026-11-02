'use client'
import { TextEffect } from '@/components/ui/text-effect'
import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <Link
          href="/"
          className="flex items-center text-xl font-medium text-black dark:text-white"
        >
          <Image
            src="/mb-gh-profile.png"
            alt="Mirko Bonomi"
            className="-ml-20 size-16 rounded-full object-cover align-middle"
            width={32}
            height={32}
          />
          <span className="ml-4">Mirko Bonomi</span>
        </Link>
        <TextEffect
          as="p"
          preset="fade"
          per="char"
          className="text-zinc-600 dark:text-zinc-500"
          delay={0.5}
        >
          Software Developer turned to AI Test Engineer
        </TextEffect>
      </div>
    </header>
  )
}
