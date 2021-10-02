import type { NextApiRequest, NextApiResponse } from 'next'
import type { Page } from 'puppeteer-core'
import core from 'puppeteer-core'
import chrome from 'chrome-aws-lambda'

export type NextApiOgImageConfig<QueryType extends string> = {
  html: (...queryParams: Record<QueryType, string | string[]>[]) => string
}

export type NextApiOgImageRequest = NextApiRequest & Partial<{ ogimage: Buffer }>

export type ExtendableNextApiRequest<T> = T extends NextApiRequest ? T : NextApiRequest
export type ExtendableNextApiResponse<T, DataType = any> = T extends NextApiResponse
  ? T
  : NextApiResponse<DataType>

export type ExtendedNextApiHandler<RequestType, ResponseType = NextApiResponse, DataType = any> = (
  request: ExtendableNextApiRequest<RequestType>,
  response: ExtendableNextApiResponse<ResponseType, DataType>,
) => void | Promise<void>

type BrowserEnvironment = {
  mode: 'development' | 'production'
  executable: string
  page: Page
  screenshot: (html: string) => Promise<Buffer>
}

export function withOGImage<QueryType extends string>(
  handler: ExtendedNextApiHandler<NextApiOgImageRequest>,
  options: NextApiOgImageConfig<QueryType>,
) {
  const createBrowserEnvironment = pipe(getMode, getChromiumExecutable, prepareWebPage, createScreenshooter)

  const { html: htmlTemplate } = options

  return async function (request: NextApiOgImageRequest, response: NextApiResponse) {
    const { query } = request
    const browserEnvironment = await createBrowserEnvironment()

    const html = htmlTemplate({ ...query } as Record<QueryType, string | string[]>)
    request.ogimage = await browserEnvironment.screenshot(html)

    handler(request, response)
  }
}

function pipe(...functions: Function[]): () => Promise<BrowserEnvironment> {
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

  const chromiumOptions = mode
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

function createScreenshooter(browserEnvironment: BrowserEnvironment) {
  const { page } = browserEnvironment

  return {
    ...browserEnvironment,
    screenshot: async function (html: string) {
      await page.setContent(html)
      const file = await page.screenshot({ type: 'png' })
      return file
    },
  }
}
