import 'isomorphic-fetch'

type RetrieveOgImageResponseType = 'image' | 'html'

type RetrieveOgImageStrategy = 'post-json' | 'get-query'

export type RetrieveOgImageProps = {
  content: string
  type: RetrieveOgImageResponseType
  strategy: RetrieveOgImageStrategy
}

export function useOgImage(routeName: string) {
  const blobToBase64 = (blob: Blob) =>
    new Promise((resolve, _) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })

  const retrieve = async (
    strategy: RetrieveOgImageStrategy,
    queryOrBody: object,
  ): Promise<RetrieveOgImageProps> => {
    const url = `/api/${routeName}${
      strategy === 'get-query' ? `?${new URLSearchParams({ ...queryOrBody }).toString()}` : ''
    }`

    const response = await fetch(url, {
      method: strategy === 'get-query' ? 'GET' : 'POST',
      ...(strategy === 'post-json'
        ? {
            body: JSON.stringify(queryOrBody),
            headers: {
              'Content-Type': 'application/json',
            },
          }
        : null),
    })

    const incomingContentType = response.headers.get('Content-Type')

    const responseType: RetrieveOgImageResponseType = incomingContentType.startsWith('text/html')
      ? 'html'
      : incomingContentType.split('/')[0].startsWith('image')
      ? 'image'
      : null

    if (!responseType) {
      throw new Error(
        `Unsupported content type ${incomingContentType}. The allowed values are "text/html" or "image/*"`,
      )
    }

    const content =
      responseType === 'html'
        ? `data:text/html;charset=utf-8,${await response.text()}`
        : await blobToBase64(await response.blob())

    return {
      content: content as string,
      type: responseType,
      strategy,
    }
  }

  return {
    retrieve,
  }
}
