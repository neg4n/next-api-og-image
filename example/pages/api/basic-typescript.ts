import { withOGImage } from 'next-api-og-image'

export default withOGImage<'testQueryParam'>(
  (request, response) => {
    response.setHeader('Content-Type', 'image/png')
    response.setHeader('Cache-Control', 'max-age 3600, must-revalidate')
    response.write(request.ogimage)
    response.end()
  },
  {
    html: ({ testQueryParam }) => {
      return `
      <html>
        <body>
          <h1>${testQueryParam}</h1>
        </body>
      </html>`
    },
  },
)
