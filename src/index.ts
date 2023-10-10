import { promises as fsPromises } from 'node:fs'
import path, { join } from 'node:path'
import { type Buffer } from 'node:buffer'
import { homedir } from 'node:os'
import { directory } from 'tempy'
import { findChrome } from 'find-chrome-bin'
import { BrowserFetcher } from 'puppeteer-core'
import { saveSingleFile } from '@pawanpaudel93/single-file'
import type { BrowserlessOptions, HtmlScreenshotSaverOptions, SaveResult } from './types'

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'

const defaultOptions: HtmlScreenshotSaverOptions = {
  browserHeight: 1080,
  browserWidth: 1920,
  userAgent: DEFAULT_USER_AGENT,
}

/**
 * Represents a class for saving HTML and screenshots.
 */
export class HtmlScreenshotSaver {
  /**
   * The options for the browser.
   * @private
   */
  private browserOptions: HtmlScreenshotSaverOptions

  /**
   * Constructs a new HtmlScreenshotSaver instance.
   * @param {HtmlScreenshotSaverOptions} [options] - The options for the HtmlScreenshotSaver.
   */
  constructor(options?: HtmlScreenshotSaverOptions) {
    this.browserOptions = { ...defaultOptions, ...options }
    this.processBrowserlessOptions(options?.browserlessOptions)
  }

  /**
   * Processes the options for the browserless service.
   * @private
   * @param {BrowserlessOptions} [options] - The options for the browserless service.
   */
  private processBrowserlessOptions(options?: BrowserlessOptions) {
    if (options?.apiKey)
      this.browserOptions.browserServer = this.constructBrowserlessUrl(options)
  }

  /**
   * Constructs the URL for the browserless service.
   * @private
   * @param {BrowserlessOptions} options - The options for the browserless service.
   * @returns {string} The constructed URL.
   */
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

  /**
   * Reads a file as a buffer.
   * @private
   * @param {string} filePath - The path to the file.
   * @returns {Promise<Buffer>} A promise that resolves with the file content as a Buffer.
   */
  private async readFileAsBuffer(filePath: string): Promise<Buffer> {
    return await fsPromises.readFile(filePath)
  }

  /**
   * Gets the path to the Chrome executable.
   * @private
   * @returns {Promise<string>} A promise that resolves with the path to the Chrome executable.
   */
  private async getChromeExecutablePath(): Promise<string> {
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

  /**
   * Gets the error message from an error object.
   * @private
   * @param {unknown} error - The error object.
   * @returns {string} The error message.
   */
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

  /**
   * Runs the browser to save the HTML and screenshot.
   * @private
   * @param {Object} params - The parameters for running the browser.
   * @param {string} params.url - The URL to save.
   * @param {string} params.outputDirectory - The output directory to save the files.
   * @param {string} params.outputHtmlFilename - The output html filename.
   * @param {string} params.outputScreenshotFilename - The output screenshot filename.
   * @returns {Promise<void>} A promise that resolves when the browser has finished saving the files.
   */
  private async runBrowser({
    url,
    outputDirectory,
    outputHtmlFilename,
    outputScreenshotFilename,
  }: {
    url: string
    outputDirectory: string
    outputHtmlFilename: string
    outputScreenshotFilename: string
  }): Promise<void> {
    const browserArgs = `["--no-sandbox", "--window-size=${this.browserOptions?.browserWidth},${this.browserOptions?.browserHeight}", "--start-maximized"]`
    const options = {
      browserArgs,
      ...this.browserOptions,
      outputDirectory,
      outputHtmlFilename,
      outputScreenshotFilename,
      url,
    } as HtmlScreenshotSaverOptions

    if (!this.browserOptions.browserServer)
      options.browserExecutablePath = await this.getChromeExecutablePath()

    await saveSingleFile(options)
  }

  /**
   * Saves the HTML and screenshot.
   *
   * @param {string} url - The URL to save.
   * @param [options] - Output options
   * @param {string} options.outputDirectory - The output directory to save the files.
   * @param {string} options.outputHtmlFilename - The output html filename.
   * @param {string} options.outputScreenshotFilename - The output screenshot filename.
   * @returns {Promise<SaveResult>} A promise that resolves with the result of the save operation.
   */
  public save = async (
    url: string,
    options?: {
      outputDirectory?: string
      outputHtmlFilename?: string
      outputScreenshotFilename?: string
    },
  ): Promise<SaveResult> => {
    const outputDirectory = options?.outputDirectory || this.browserOptions.outputDirectory || directory()
    const outputHtmlFilename = options?.outputHtmlFilename || this.browserOptions.outputHtmlFilename || 'index.html'
    const outputScreenshotFilename = options?.outputScreenshotFilename || this.browserOptions.outputScreenshotFilename || 'screenshot.png'

    try {
      try {
        await fsPromises.access(outputDirectory)
      }
      catch (e) {
        await fsPromises.mkdir(outputDirectory, { recursive: true })
      }

      await this.runBrowser({
        url,
        outputDirectory,
        outputHtmlFilename,
        outputScreenshotFilename,
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
        savedDirectory: outputDirectory,
        webpage: path.join(outputDirectory, outputHtmlFilename),
        screenshot: this.browserOptions?.saveScreenshot ? path.join(outputDirectory, outputScreenshotFilename) : undefined,
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
        savedDirectory: '',
        webpage: '',
        screenshot: '',
        title: '',
        timestamp: 0,
      }
    }
  }
}

export type { BrowserlessOptions, HtmlScreenshotSaverOptions, SaveResult } from './types'
