import { withOGImage } from 'next-api-og-image'

export default withOGImage<'testQueryParam'>({
  template: {
    html: async ({ testQueryParam }) => {
      return `
        <html>
          <body>
            <h1>${testQueryParam}</h1>
          </body>
        </html>
      `
    },
  },
})
