import { withOGImage } from 'next-api-og-image'

export default withOGImage({
  html: ({ myQueryParam }) => `<h1>${myQueryParam}</h1>`,
})
