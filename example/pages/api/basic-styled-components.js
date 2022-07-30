import React from 'react'
import { withOGImage } from 'next-api-og-image'
import { renderToString } from 'react-dom/server'
import styled, { ServerStyleSheet } from 'styled-components'

function Markup({ myQueryParam }) {
  return <Wrapper>🔥 {myQueryParam}</Wrapper>
}

export default withOGImage({
  template: {
    html: ({ myQueryParam }) => {
      const sheet = new ServerStyleSheet()
      try {
        const html = renderToString(sheet.collectStyles(<Markup myQueryParam={myQueryParam} />))
        const styleTags = sheet.getStyleTags()

        return `<html><style>body {margin:0}</style>${styleTags}<body>${html}</body></html>`
      } catch (error) {
        console.error(error)
        return 'error'
      } finally {
        sheet.seal()
      }
    },
  },
})

const Wrapper = styled.div`
  box-sizing: border-box;
  background: #fafafa;
  font-size: 5rem;
  border: 10rem solid red;
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
`


// =====================================
// NOTE: This is for interactive example
// please do not copy or use code below!
// =====================================
export const _interactiveExampleProps = {
  type: 'query',
  props: ['myQueryParam'],
} 
