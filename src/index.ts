import type { NextApiRequest, NextApiResponse } from 'next'
import type { Page } from 'puppeteer-core'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import twemoji from 'twemoji'
import core from 'puppeteer-core'
import chrome from 'chrome-aws-lambda'

export type NextApiOgImageQuery<QueryType extends string> = Record<QueryType, string | Array<string>>

type NextApiOgImageHtmlTemplate<QueryType extends string> = {
  html: (...queryParams: Array<NextApiOgImageQuery<QueryType>>) => string | Promise<string>
  react?: never
}

type NextApiOgImageReactTemplate<QueryType extends string> = {
  react: (...queryParams: Array<NextApiOgImageQuery<QueryType>>) => ReactElement | Promise<ReactElement>
  html?: never
}

export type NextApiOgImageConfig<QueryType extends string> = {
  template: NextApiOgImageHtmlTemplate<QueryType> | NextApiOgImageReactTemplate<QueryType>
  contentType?: string
  cacheControl?: string
  dev?: Partial<{
    inspectHtml: boolean
  }>
}

type BrowserEnvironment = {
  mode: 'development' | 'production'
  executable: string
  page: Page
  createImage: (html: string) => Promise<Buffer> | Promise<string>
}

export function withOGImage<QueryType extends string>(options: NextApiOgImageConfig<QueryType>) {
  const defaultOptions: Omit<NextApiOgImageConfig<QueryType>, 'template'> = {
    contentType: 'image/png',
    cacheControl: 'max-age 3600, must-revalidate',
    dev: {
      inspectHtml: true,
    },
  }

  options = { ...defaultOptions, ...options }

  const {
    template: { html: htmlTemplate, react: reactTemplate },
    cacheControl,
    contentType,
    dev: { inspectHtml },
  } = options

  if (htmlTemplate && reactTemplate) {
    throw new Error('Ambigious template provided. You must provide either `html` or `react` template.')
  }

  if (!htmlTemplate && !reactTemplate) {
    throw new Error('No template was provided.')
  }

  const createBrowserEnvironment = pipe(
    getMode,
    getChromiumExecutable,
    prepareWebPage,
    createImageFactory(inspectHtml),
  )

  return async function (request: NextApiRequest, response: NextApiResponse) {
    const { query } = request
    const browserEnvironment = await createBrowserEnvironment()

    const html =
      htmlTemplate && !reactTemplate
        ? await htmlTemplate({ ...query } as NextApiOgImageQuery<QueryType>)
        : renderToStaticMarkup(await reactTemplate({ ...query } as NextApiOgImageQuery<QueryType>))

    response.setHeader(
      'Content-Type',
      browserEnvironment.mode === 'development' && inspectHtml ? 'text/html' : contentType,
    )
    response.setHeader('Cache-Control', cacheControl)

    response.write(await browserEnvironment.createImage(emojify(html)))
    response.end()
  }
}

function emojify(html: string) {
  const emojified = twemoji.parse(html, { folder: 'svg', ext: '.svg' })

  const emojiStyle = `
    .emoji {
      height: 1em;
      width: 1em;
      margin: 0 .05em 0 .1em;
      vertical-align: -0.1em;
    }
  `

  return `<style>${emojiStyle}</style>${emojified}`
}

function pipe(...functions: Array<Function>): () => Promise<BrowserEnvironment> {
  return async function () {
    return await functions.reduce(
      async (acc, fn) => await fn(await acc),
      Promise.resolve({} as BrowserEnvironment),
    )
  }
}

function getMode(browserEnvironment: BrowserEnvironment) {
  const mode = process.env.NODE_ENV || 'development'
  return { ...browserEnvironment, mode }
}

function getChromiumExecutable(browserEnvironment: BrowserEnvironment) {
  const executable =
    process.platform === 'win32'
      ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'linux'
      ? '/usr/bin/google-chrome'
      : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

  return { ...browserEnvironment, executable }
}

async function prepareWebPage(browserEnvironment: BrowserEnvironment) {
  const { page, mode, executable } = browserEnvironment

  if (page) {
    return { ...browserEnvironment, page }
  }

  const chromiumOptions =
    mode === 'development'
      ? { args: [], executablePath: executable, headless: true }
      : {
          args: chrome.args,
          executablePath: await chrome.executablePath,
          headless: chrome.headless,
        }

  const browser = await core.launch(chromiumOptions)
  const newPage = await browser.newPage()
  await newPage.setViewport({ width: 1200, height: 630 })

  return { ...browserEnvironment, page: newPage }
}

function createImageFactory(inspectHtml: boolean) {
  return function (browserEnvironment: BrowserEnvironment) {
    const { page, mode } = browserEnvironment

    return {
      ...browserEnvironment,
      createImage: async function (html: string) {
        await page.setContent(html)
        const file =
          mode === 'development' && inspectHtml
            ? await page.content()
            : await page.screenshot({ type: 'png', encoding: 'binary' })
        return file
      },
    }
  }
}
