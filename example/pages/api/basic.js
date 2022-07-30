import { withOGImage } from 'next-api-og-image'

export default withOGImage({
  template: {
    react: ({ myQueryParam }) => <div>🔥 {myQueryParam}</div>,
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
