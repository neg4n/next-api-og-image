import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/provider'

import { theme } from '../theme'
import { GithubCorner } from '../components/GithubCorner'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <a href="https://github.com/neg4n/next-api-og-image">
        <GithubCorner />
      </a>
      <a>
      </a>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
