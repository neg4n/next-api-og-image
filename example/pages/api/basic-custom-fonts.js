import * as path from 'path'
import * as fs from 'fs/promises'
import { withOGImage } from 'next-api-og-image'

export default withOGImage({
  html: async ({ myQueryParam }) => {
    const [interRegular] = await fontFilesToBase64(['Inter-Regular'])
    return `
    <style>
      @font-face {
        font-family: 'Inter';
        font-style:  normal;
        font-weight: normal;
        src: url(data:font/woff2;charset=utf-8;base64,${interRegular}) format('woff2');
      }

      body {
        font-family: 'Inter', sans-serif;
      }
    </style>
    <h1>${myQueryParam}</h1>`
  },
})

async function fontFilesToBase64(fonts) {
  const fontsDirectory = path.resolve('fonts')

  return await Promise.all(
    fonts.map(async (font) => {
      const fontPath = path.join(fontsDirectory, `${font}.woff2`)
      const fontFile = await fs.readFile(fontPath)
      return fontFile.toString('base64')
    }),
  )
}
