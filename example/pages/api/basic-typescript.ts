import { withOGImage } from 'next-api-og-image'

export default withOGImage<'query', 'testQueryParam'>({
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


// =====================================
// NOTE: This is for interactive example
// please do not copy or use code below!
// =====================================
export const _interactiveExampleProps = {
  type: 'query',
  props: ['testQueryParam'],
} 
