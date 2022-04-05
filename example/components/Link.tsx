import type { ReactNode } from 'react'
import NextLink from 'next/link'
import { Link as ChakraLink } from '@chakra-ui/layout'

type LinkProps = {
  href: string
  children: ReactNode
}

export function Link({ href, children }: LinkProps) {
  return (
    <NextLink href={href} passHref>
      <ChakraLink color="teal.500">{children}</ChakraLink>
    </NextLink>
  )
}
