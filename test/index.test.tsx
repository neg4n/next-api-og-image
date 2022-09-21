import React from 'react'
import request from 'supertest'

import { createDummyNextServer, devModeResponseHTML } from './__utils__/next'
import { withOGImage } from '../src'

describe(withOGImage, () => {
  it('should return basic paragraph built on HTML template filled with value from GET request and query params', async () => {
    type Parameters = 'test'
    const handler = withOGImage<'query', Parameters>({
      template: { html: ({ test }) => `<p>${test}</p>` },
    })

    const server = createDummyNextServer(handler)
    const response = await request(server).get('/').query({ test: 'abc' })

    expect(response.status).toEqual(200)
    expect(response.text).toEqual(devModeResponseHTML('<p>abc</p>'))
  })

  it('should return basic paragraph built on JSX template filled with value from GET request and query params', async () => {
    type Parameters = 'test'
    const handler = withOGImage<'query', Parameters>({
      template: { react: ({ test }) => <p>{test}</p> },
    })

    const server = createDummyNextServer(handler)
    const response = await request(server).get('/').query({ test: 'abc' })

    expect(response.status).toEqual(200)
    expect(response.text).toEqual(devModeResponseHTML('<p>abc</p>'))
  })
})
