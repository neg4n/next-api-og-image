import { withOGImage } from 'next-api-og-image'

type BodyParams = {
  test: string
  another: {
    foo: {
      bar: string
    }
  }
}

export default withOGImage<'body', BodyParams>({
  strategy: 'body',
  template: {
    react: ({
      test,
      another: {
        foo: { bar },
      },
    }) => {
      return (
        <html>
          <body>
            <h1>{test}</h1>
            <h2>{bar}</h2>
          </body>
        </html>
      )
    },
  },
})
