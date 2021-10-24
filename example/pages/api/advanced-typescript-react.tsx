import { withOGImage } from 'next-api-og-image'
import { interRegular } from '../../fonts/inter'

const style = `
  @font-face {
    font-family: 'Inter';
    font-style:  normal;
    font-weight: normal;
    src: url(data:font/woff2;charset=utf-8;base64,${interRegular}) format('woff2');
  }

  body {
    font-family: 'Inter', sans-serif;
  }

  .container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`

export default withOGImage<'query', 'testQueryParam'>({
  template: {
    react: async ({ testQueryParam }) => {
      const value = await someLongRunningValueGetter()
      return (
        <html>
          <head>
            <style dangerouslySetInnerHTML={{ __html: style }} />
          </head>
          <body>
            <div className="container">
              <h1>{testQueryParam}</h1>
              <h2>{value}</h2>
            </div>
          </body>
        </html>
      )
    },
  },
  dev: {
    inspectHtml: false,
  },
})

function someLongRunningValueGetter() {
  return new Promise((resolve: (value: string) => void) => {
    setTimeout(() => {
      resolve("Value in setTimeout's (500ms) callback")
    }, 500)
  })
}
