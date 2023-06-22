import { promises as fsPromises } from 'node:fs'
import path, { join } from 'node:path'
import { type Buffer } from 'node:buffer'
import { homedir } from 'node:os'
import { directory } from 'tempy'
import { findChrome } from 'find-chrome-bin'
import { BrowserFetcher } from 'puppeteer-core'
import { defaultArgs, runBrowser } from '@pawanpaudel93/single-file'

export interface SaveResult {
  status: 'success' | 'error'
  message: string
  savedFolderPath: string
  webpage: string
  screenshot: string
  title: string
  timestamp: number
}

export interface BrowserlessOptions {
  apiKey: string
  blockAds?: boolean
  stealth?: boolean
  userDataDir?: string
  keepalive?: number
  ignoreDefaultArgs?: string
  timeout?: number
}

export interface HtmlScreenshotSaverOptions {
  headless?: boolean
  height?: number
  width?: number
  userAgent?: string
  httpProxy?: {
    server?: string
    username?: string
    password?: string
  }
  browserlessOptions?: BrowserlessOptions
}

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'

const defaultOptions: HtmlScreenshotSaverOptions = {
  headless: true,
  height: 1080,
  width: 1920,
  userAgent: DEFAULT_USER_AGENT,
  httpProxy: {
    server: '',
    username: '',
    password: '',
  },
}

export class HtmlScreenshotSaver {
  private browserServer?: string
  private browserOptions?: HtmlScreenshotSaverOptions

  constructor(options?: HtmlScreenshotSaverOptions) {
    this.browserOptions = { ...defaultOptions, ...options }
    this.processBrowserlessOptions(options?.browserlessOptions)
  }

  private processBrowserlessOptions(options?: BrowserlessOptions) {
    if (options?.apiKey)
      this.browserServer = this.constructBrowserlessUrl(options)
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
    if (this.browserOptions?.httpProxy?.server)
      params.push(`--proxy-server=${this.browserOptions.httpProxy.server}`)
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
    if (this.browserOptions?.headless !== undefined)
      params.push(`headless=${this.browserOptions.headless}`)
    if (timeout)
      params.push(`timeout=${timeout}`)
    params.push(`--window-size=${this.browserOptions?.width},${this.browserOptions?.height}`)
    params.push(`--user-agent=${this.browserOptions?.userAgent ?? DEFAULT_USER_AGENT}`)

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
    basePath,
    output,
  }: {
    url: string
    basePath: string
    output: string
  }) {
    const browserArgs = `["--no-sandbox", "--window-size=${this.browserOptions?.width},${this.browserOptions?.height}", "--start-maximized"]`
    const options = {
      ...defaultArgs,
      basePath,
      browserArgs,
      url,
      output,
      userAgent: this.browserOptions?.userAgent,
      browserWidth: this.browserOptions?.width,
      browserHeight: this.browserOptions?.height,
      browserServer: this.browserServer,
      browserHeadless: this.browserOptions?.headless,
      httpProxyServer: this.browserOptions?.httpProxy?.server ?? '',
      httpProxyUsername: this.browserOptions?.httpProxy?.username ?? '',
      httpProxyPassword: this.browserOptions?.httpProxy?.password ?? '',
    }

    if (!this.browserServer)
      options.browserExecutablePath = await this.getChromeExecutablePath()

    await runBrowser(options)
  }

  public save = async (
    url: string,
    folderPath?: string,
  ): Promise<SaveResult> => {
    try {
      if (!folderPath)
        folderPath = directory()

      await fsPromises.access(folderPath)

      await this.runBrowser({
        url,
        basePath: folderPath as string,
        output: path.resolve(folderPath, 'index.html'),
      })

      const metadata: {
        title: string
        url: string
      } = JSON.parse(
        (
          await this.readFileAsBuffer(path.join(folderPath, 'metadata.json'))
        ).toString(),
      )
      const timestamp = Math.floor(Date.now() / 1000)

      return {
        status: 'success',
        message: 'Saved successfully',
        savedFolderPath: folderPath,
        webpage: path.join(folderPath, 'index.html'),
        screenshot: path.join(folderPath, 'screenshot.png'),
        title: metadata.title,
        timestamp,
      }
    }
    catch (error) {
      if (folderPath)
        await fsPromises.rm(folderPath, { recursive: true, force: true })

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
