import { withOGImage } from 'next-api-og-image'

export default withOGImage({
  template: {
    html: ({ myQueryParam }) => `
      <html>
        <head>
          <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          <h1 class="flex flex-row text-6xl text-blue-300">${myQueryParam}<span>💻</span></h1>
        </body>
      </html>
    `,
  },
})

// =====================================
// NOTE: This is for interactive example
// please do not copy or use code below!
// =====================================
export const _interactiveExampleProps = {
  type: 'query',
  props: ['myQueryParam'],
} 
