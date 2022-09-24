import type { NextApiRequest, NextApiResponse } from 'next'
import type { Except, RequireExactlyOne } from 'type-fest'
import type { Page, Viewport } from 'puppeteer-core'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import isLambda from 'is-lambda'
import os from 'os'
import deepMerge from 'deepmerge'
import twemoji from 'twemoji'
import core from 'puppeteer-core'
import chrome from 'chrome-aws-lambda'

const STRATEGY_OPTIONS = ['body', 'query'] as const
type StrategyOption = typeof STRATEGY_OPTIONS[number]

const ENV_MODES = ['development', 'staging', 'production', 'testing'] as const
type EnvMode = typeof ENV_MODES[number]

type ImageType = 'png' | 'jpeg' | 'webp'

type StrategyAwareParams<
  T extends StrategyOption = 'query',
  StrategyDetails extends string | object = string,
> = T extends 'body'
  ? StrategyDetails
  : Record<StrategyDetails extends string ? StrategyDetails : string, NonNullable<string>>

type NextApiRequestWithOgImage = {
  image: string | Buffer
}

type ChromeOptions = {
  args?: string[]
  executable?: string
}

export type NextApiOgImageConfig<
  Strategy extends StrategyOption,
  StrategyDetails extends string | object = string,
> = {
  template: RequireExactlyOne<
    Partial<{
      html: (params: StrategyAwareParams<Strategy, StrategyDetails>) => string | Promise<string>
      react: (params: StrategyAwareParams<Strategy, StrategyDetails>) => ReactElement | Promise<ReactElement>
    }>,
    'html' | 'react'
  >
  strategy?: StrategyOption
  cacheControl?: string
  width?: number
  height?: number
  deviceScaleFactor?: number
  type?: ImageType
  quality?: number
  hook?: (request: NextApiRequestWithOgImage) => Map<string, string> | Promise<Map<string, string>>
  chrome?: ChromeOptions
  dev?: Partial<{
    inspectHtml: boolean
    errorsInResponse: boolean
  }>
}

type BrowserEnvironment = {
  envMode: EnvMode
  executable: string
  page: Page
  createImage: (html: string) => Promise<Buffer> | Promise<string>
}

export function withOGImage<
  Strategy extends StrategyOption = 'query',
  StrategyDetails extends string | object = string,
>(options: NextApiOgImageConfig<Strategy, StrategyDetails>) {
  const defaultOptions: Except<NextApiOgImageConfig<Strategy, StrategyDetails>, 'template'> = {
    strategy: 'query',
    cacheControl: 'max-age 3600, must-revalidate',
    width: 1200,
    height: 630,
    deviceScaleFactor: 1,
    type: 'png',
    quality: 90,
    hook: null,
    chrome: {
      args: null,
      executable: null,
    },
    dev: {
      inspectHtml: true,
      errorsInResponse: true,
    },
  }

  options = deepMerge(defaultOptions, options) as NextApiOgImageConfig<Strategy, StrategyDetails>

  const {
    template: { html: htmlTemplate, react: reactTemplate },
    cacheControl,
    strategy,
    type,
    width,
    hook,
    height,
    deviceScaleFactor,
    quality,
    chrome: { args, executable },
    dev: { inspectHtml, errorsInResponse },
  } = options

  if (htmlTemplate && reactTemplate) {
    throw new Error('Ambigious template provided. You must provide either `html` or `react` template.')
  }

  if (!htmlTemplate && !reactTemplate) {
    throw new Error('No template was provided.')
  }

  const envMode = process.env.NODE_ENV as EnvMode

  const createBrowserEnvironment = pipe(
    getChromiumExecutable,
    prepareWebPageFactory({ width, height, deviceScaleFactor }, { args, executable }),
    createImageFactory({ inspectHtml, type, quality }),
  )

  return async function (request: NextApiRequest, response: NextApiResponse) {
    checkStrategy(strategy, !isProductionLikeMode(envMode) ? errorsInResponse : false, request, response)

    const params = stringifyObjectProps(strategy === 'query' ? request.query : request.body)
    const browserEnvironment = await createBrowserEnvironment()

    const html =
      htmlTemplate && !reactTemplate
        ? await htmlTemplate({ ...params } as StrategyAwareParams<Strategy, StrategyDetails>)
        : renderToStaticMarkup(
            await reactTemplate({ ...params } as StrategyAwareParams<Strategy, StrategyDetails>),
          )

    const image = await browserEnvironment.createImage(emojify(html))

    if (!!hook) {
      const extendedRequest: NextApiRequestWithOgImage = {
        ...request,
        image,
      }

      const headers = await hook(extendedRequest)

      if (!!headers) {
        for (const [extendedheaderName, extendedHeaderValue] of headers.entries()) {
          response.setHeader(extendedheaderName, extendedHeaderValue)
        }
      }
    }

    response.setHeader(
      'Content-Type',
      !isProductionLikeMode(envMode) && inspectHtml ? 'text/html' : type ? `image/${type}` : 'image/png',
    )
    response.setHeader('Cache-Control', cacheControl)
    response.write(image)
    response.end()
  }
}

function isProductionLikeMode(envMode: EnvMode) {
  return envMode === 'production' || envMode === 'staging'
}

function checkStrategy(
  strategy: StrategyOption,
  errorsInResponse: boolean,
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const checks: Record<StrategyOption, () => void> = {
    body: () => {
      const {
        method,
        headers: { 'content-type': contentType },
      } = request

      if (method !== 'POST' && contentType !== 'application/json') {
        const message = `Strategy is set to \`body\` so parameters must be passed by POST request and JSON payload. Current method: ${method} and current content type: ${contentType}`

        if (errorsInResponse) {
          response.json({ message })
        }

        throw new Error(message)
      }
    },
    query: () => {
      const { method } = request

      if (method !== 'GET') {
        const message = `Strategy is set to \`query\` so parameters must be passed by GET request and query params. Current method: ${method}`

        if (errorsInResponse) {
          response.json({ message })
        }

        throw new Error(message)
      }
    },
  }
  const currentCheck = checks[strategy]

  if (!currentCheck) {
    throw new Error(`Unknown strategy provided. Possible values: ${STRATEGY_OPTIONS}`)
  }

  currentCheck()
}

function stringifyObjectProps(object: object) {
  return JSON.parse(
    JSON.stringify(object, (key, value) => (value && typeof value === 'object' ? value : `${value}`)),
  )
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
      Promise.resolve({ envMode: process.env.NODE_ENV as EnvMode } as BrowserEnvironment),
    )
  }
}

function getChromiumExecutable(browserEnvironment: BrowserEnvironment) {
  let executable = null

  if (process.platform === 'win32') {
    if (['arm64', 'ppc64', 'x64', 's390x'].includes(os.arch())) {
      executable = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    } else {
      executable = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    }
  } else if (process.platform === 'linux') {
    executable = '/usr/bin/google-chrome'
  } else {
    executable = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }

  return { ...browserEnvironment, executable }
}

function prepareWebPageFactory(viewPort: Viewport, chromeOptions: ChromeOptions) {
  return async function (browserEnvironment: BrowserEnvironment) {
    const { page, envMode, executable } = browserEnvironment

    if (page) {
      return { ...browserEnvironment, page }
    }

    const chromiumOptions = await getChromiumOptions(envMode, executable, chromeOptions)

    const browser = await core.launch(chromiumOptions)
    const newPage = await browser.newPage()
    await newPage.setViewport(viewPort)

    return { ...browserEnvironment, page: newPage }
  }
}

async function getChromiumOptions(
  envMode: EnvMode,
  defaultExecutable: string,
  chromeOptions?: ChromeOptions,
) {
  if (!isProductionLikeMode(envMode)) {
    return {
      args: chromeOptions?.args ?? [],
      executablePath: chromeOptions?.executable ?? defaultExecutable,
      headless: true,
    }
  } else {
    if (isLambda) {
      return {
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
      }
    } else {
      return {
        args: chromeOptions?.args ?? [],
        executablePath: chromeOptions?.executable ?? defaultExecutable,
        headless: true,
      }
    }
  }
}

function createImageFactory({
  inspectHtml,
  type,
  quality,
}: {
  inspectHtml: boolean
  type: ImageType
  quality: number
}) {
  return function (browserEnvironment: BrowserEnvironment) {
    const { page, envMode } = browserEnvironment

    return {
      ...browserEnvironment,
      createImage: async function (html: string) {
        await page.setContent(html)
        const file =
          !isProductionLikeMode(envMode) && inspectHtml
            ? await page.content()
            : await page.screenshot({ type, encoding: 'binary', ...(type === 'jpeg' ? { quality } : null) })
        return file
      },
    }
  }
}
