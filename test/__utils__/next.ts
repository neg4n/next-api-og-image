import { NextApiRequest, NextApiResponse } from 'next'
import { createServer, IncomingMessage, ServerResponse } from 'http'

class DummyNextApiRequest extends IncomingMessage {
  get query() {
    const [, parameters] = this.url.split('/?')
    const urlSearchParams = new URLSearchParams(parameters)
    return Object.fromEntries(urlSearchParams)
  }
}

class DummyNextApiResponse extends ServerResponse {
  json(data: Record<string, unknown>) {
    this.setHeader('Content-Type', 'application/json')
    this.end(JSON.stringify(data))
  }
}

export function createDummyNextServer(handler) {
  const serverOptions = { IncomingMessage: DummyNextApiRequest, ServerResponse: DummyNextApiResponse }
  return createServer(serverOptions, (request, response) => {
    const nextRequest = request as NextApiRequest
    return handler(request as NextApiRequest, response as NextApiResponse)
  })
}

export function devModeResponseHTML(html: string) {
  return `<html><head><style>
    .emoji {
      height: 1em;
      width: 1em;
      margin: 0 .05em 0 .1em;
      vertical-align: -0.1em;
    }
  </style></head><body>${html}</body></html>`
}
