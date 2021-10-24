import { withOGImage } from 'next-api-og-image'

enum QueryParams {
  'test',
  'bar',
  'fizz',
}

export default withOGImage<'query', keyof typeof QueryParams>({
  strategy: 'query', // Query strategy is the default one
  template: {
    react: ({ test, bar, fizz }) => {
      return (
        <html>
          <body>
            <h1>{test}</h1>
            <h2>{bar}</h2>
            <h3>{fizz}</h3>
          </body>
        </html>
      )
    },
  },
})
