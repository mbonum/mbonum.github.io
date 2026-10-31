import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import { ComponentPropsWithoutRef } from 'react'
import { highlight } from 'sugar-high'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Cover: ({
      src,
      alt,
      caption,
      width,
      height,
      fill,
    }: {
      src: string
      alt: string
      caption: string
      width: number
      height: number
      fill: boolean
    }) => {
      return (
        <figure>
          <Image
            src={src}
            alt={alt}
            className="rounded-xl"
            width={width}
            height={height}
            fill={fill}
          />
          <figcaption className="text-center">{caption}</figcaption>
        </figure>
      )
    },
    code: ({ children, ...props }: ComponentPropsWithoutRef<'code'>) => {
      const codeHTML = highlight(children as string)
      return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
    },
  }
}
