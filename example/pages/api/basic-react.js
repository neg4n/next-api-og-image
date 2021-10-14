import { withOGImage } from 'next-api-og-image'

export default withOGImage({
  template: {
    react: ({ myQueryParam }) => <div>🔥 {myQueryParam}</div>,
  },
})
