import type { NextApiRequest, NextApiResponse } from 'next'
import type { Page } from 'puppeteer-core'
import twemoji from 'twemoji'
import path from 'path'
import fs from 'fs'
import core from 'puppeteer-core'
import chrome from 'chrome-aws-lambda'

export type NextApiOgImageConfig<QueryType extends string> = {
  html: (...queryParams: Array<Record<QueryType, string | Array<string>>>) => string | Promise<string>
  contentType?: string
  cacheControl?: string
}

type BrowserEnvironment = {
  mode: 'development' | 'production'
  executable: string
  page: Page
  screenshot: (html: string) => Promise<Buffer>
}

export function withOGImage<QueryType extends string>(options: NextApiOgImageConfig<QueryType>) {
  const createBrowserEnvironment = pipe(getMode, getChromiumExecutable, prepareWebPage, createScreenshooter)

  const defaultOptions: Omit<NextApiOgImageConfig<QueryType>, 'html'> = {
    contentType: 'image/png',
    cacheControl: 'max-age 3600, must-revalidate',
  }

  options = { ...defaultOptions, ...options }

  const { html: htmlTemplate, cacheControl, contentType } = options

  if (!htmlTemplate) {
    throw new Error('Missing html template')
  }

  return async function (request: NextApiRequest, response: NextApiResponse) {
    const { query } = request
    const browserEnvironment = await createBrowserEnvironment()

    const html = await htmlTemplate({ ...query } as Record<QueryType, string | string[]>)

    response.setHeader('Content-Type', contentType)
    response.setHeader('Cache-Control', cacheControl)

    response.write(await browserEnvironment.screenshot(emojify(html)))
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

export function fontFilesToBase64(
  fonts: Array<string>,
  fontsDirectory: string,
  extension?: string,
): Array<string> {
  const fontExtension = extension || 'woff2'

  return fonts.map((font) => {
    const fontPath = path.join(fontsDirectory, `${font}.${fontExtension}`)
    const fontFile = fs.readFileSync(fontPath)
    return fontFile.toString('base64')
  })
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
