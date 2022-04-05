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
  dev: {
  inspectHtml: false,
  },
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


// =====================================
// NOTE: This is for interactive example
// please do not copy or use code below!
// =====================================
export const _interactiveExampleProps = {
  type: 'body',
  props: ['test', 'another.foo.bar'],
} 
