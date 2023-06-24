import { promises as fsPromises } from 'node:fs'
import path, { join } from 'node:path'
import { type Buffer } from 'node:buffer'
import { homedir } from 'node:os'
import { directory } from 'tempy'
import { findChrome } from 'find-chrome-bin'
import { BrowserFetcher } from 'puppeteer-core'
import { saveSingleFile } from '@pawanpaudel93/single-file'
import type { BrowserlessOptions, HtmlScreenshotSaverOptions, SaveResult } from './types'

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'

const defaultOptions: HtmlScreenshotSaverOptions = {
  browserHeight: 1080,
  browserWidth: 1920,
  userAgent: DEFAULT_USER_AGENT,
}

export class HtmlScreenshotSaver {
  private browserOptions: HtmlScreenshotSaverOptions

  constructor(options?: HtmlScreenshotSaverOptions) {
    this.browserOptions = { ...defaultOptions, ...options }
    this.processBrowserlessOptions(options?.browserlessOptions)
  }

  private processBrowserlessOptions(options?: BrowserlessOptions) {
    if (options?.apiKey)
      this.browserOptions.browserServer = this.constructBrowserlessUrl(options)
  }

  private constructBrowserlessUrl(options: BrowserlessOptions): string {
    const {
      apiKey,
      blockAds,
      stealth,
      userDataDir,
      keepalive,
      ignoreDefaultArgs,
      timeout,
    } = options

    const params: string[] = []
    params.push(`token=${apiKey}`)
    if (this.browserOptions?.httpProxyServer)
      params.push(`--proxy-server=${this.browserOptions.httpProxyServer}`)
    if (blockAds)
      params.push('blockAds')
    if (stealth)
      params.push('stealth')
    if (userDataDir)
      params.push(`--user-data-dir=${userDataDir}`)
    if (keepalive)
      params.push(`keepalive=${keepalive}`)
    if (ignoreDefaultArgs)
      params.push(`ignoreDefaultArgs=${ignoreDefaultArgs}`)
    if (this.browserOptions?.browserHeadless !== undefined)
      params.push(`headless=${this.browserOptions.browserHeadless}`)
    if (timeout)
      params.push(`timeout=${timeout}`)
    params.push(`--window-size=${this.browserOptions?.browserWidth},${this.browserOptions?.browserHeight}`)
    params.push(`--user-agent=${this.browserOptions?.userAgent}`)

    return `wss://chrome.browserless.io/?${params.join('&')}`
  }

  private async readFileAsBuffer(filePath: string): Promise<Buffer> {
    return await fsPromises.readFile(filePath)
  }

  private async getChromeExecutablePath() {
    const downloadPath
      = process.env.PUPPETEER_DOWNLOAD_PATH
      ?? process.env.npm_config_puppeteer_download_path
      ?? process.env.npm_package_config_puppeteer_download_path

    const cacheDirectory
      = process.env.PUPPETEER_CACHE_DIR
      ?? process.env.npm_config_puppeteer_cache_dir
      ?? process.env.npm_package_config_puppeteer_cache_dir
      ?? join(homedir(), '.cache', 'puppeteer')

    const chromePath = downloadPath ?? cacheDirectory
    const { executablePath } = await findChrome({
      download: {
        puppeteer: { BrowserFetcher },
        path: chromePath,
        revision: '1095492',
      },
    })
    return executablePath
  }

  private getErrorMessage(error: unknown): string {
    if (
      typeof error === 'object'
      && error !== null
      && 'message' in error
      && typeof (error as Record<string, unknown>).message === 'string'
    )
      return (error as { message: string }).message

    try {
      return new Error(JSON.stringify(error)).message
    }
    catch {
      return String(error)
    }
  }

  private async runBrowser({
    url,
    outputDirectory,
  }: {
    url: string
    outputDirectory: string
  }) {
    const browserArgs = `["--no-sandbox", "--window-size=${this.browserOptions?.browserWidth},${this.browserOptions?.browserHeight}", "--start-maximized"]`
    const options = {
      ...this.browserOptions,
      outputDirectory,
      browserArgs,
      url,
    } as HtmlScreenshotSaverOptions

    if (!this.browserOptions.browserServer)
      options.browserExecutablePath = await this.getChromeExecutablePath()

    await saveSingleFile(options)
  }

  public save = async (
    url: string,
    outputDirectory?: string,
  ): Promise<SaveResult> => {
    try {
      if (!outputDirectory)
        outputDirectory = directory()

      await fsPromises.access(outputDirectory)

      await this.runBrowser({
        url,
        outputDirectory: outputDirectory as string,
      })

      const metadata: {
        title: string
        url: string
      } = JSON.parse(
        (
          await this.readFileAsBuffer(path.join(outputDirectory, 'metadata.json'))
        ).toString(),
      )
      const timestamp = Math.floor(Date.now() / 1000)

      return {
        status: 'success',
        message: 'Saved successfully',
        savedFolderPath: outputDirectory,
        webpage: path.join(outputDirectory, 'index.html'),
        screenshot: this.browserOptions?.saveScreenshot ? path.join(outputDirectory, 'screenshot.png') : undefined,
        title: metadata.title,
        timestamp,
      }
    }
    catch (error) {
      if (outputDirectory)
        await fsPromises.rm(outputDirectory, { recursive: true, force: true })

      return {
        status: 'error',
        message: this.getErrorMessage(error),
        savedFolderPath: '',
        webpage: '',
        screenshot: '',
        title: '',
        timestamp: 0,
      }
    }
  }
}
