import NextImage from 'next/image'
import { Box } from '@chakra-ui/react'

type ImagePreviewProps = {
  src: string
}

export function ImagePreview({ src }: ImagePreviewProps) {
  return (
    <Box w="100%">
      {src ? (
        <NextImage width={1920} height={1080} src={src} />
      ) : (
        <Box w="100%" h="100%">
          Please submit form
        </Box>
      )}
    </Box>
  )
}
