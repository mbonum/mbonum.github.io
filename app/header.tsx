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
          className="flex flex-col items-start gap-3 text-xl font-medium text-black dark:text-white sm:flex-row sm:items-center sm:gap-4"
        >
          <Image
            src="/mb-gh-profile.png"
            alt="Mirko Bonomi"
            className="size-16 rounded-full object-cover"
            width={32}
            height={32}
            loading="eager"
          />
          <span className="flex flex-col gap-3 sm:gap-0">
            <span>Mirko Bonomi</span>
            <TextEffect
              as="p"
              preset="fade"
              per="char"
              className="text-zinc-600 dark:text-zinc-500"
              delay={0.5}
            >
              Software Engineer
            </TextEffect>
          </span>
        </Link>
      </div>
    </header>
  )
}
