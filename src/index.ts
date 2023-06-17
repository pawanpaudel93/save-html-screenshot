import fs, { constants, promises as fsPromises } from 'node:fs'
import path, { join } from 'node:path'
import { type Buffer } from 'node:buffer'
import { homedir } from 'node:os'
import { findChrome } from 'find-chrome-bin'
import { temporaryDirectory } from 'tempy'
import fileUrl from 'file-url'
import { packageDirectory } from 'pkg-dir'
import { execFile } from 'promisify-child-process'
import * as puppeteer from 'puppeteer-core'

export interface SaveReturnType {
  status: 'success' | 'error'
  message: string
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

export interface BrowserOptions {
  headless?: boolean
  height?: number
  width?: number
  userAgent?: string
  httpProxy?: {
    server?: string
    username?: string
    password?: string
  }
}

interface HtmlScreenshotSaverOptions {
  browserOptions?: BrowserOptions
  browserlessOptions?: BrowserlessOptions
}

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'

const defaultBrowserOptions: BrowserOptions = {
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
  private browserOptions?: BrowserOptions

  constructor(options?: HtmlScreenshotSaverOptions) {
    this.browserOptions = { ...defaultBrowserOptions, ...options?.browserOptions }
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
    params.push(`user-agent=${this.browserOptions?.userAgent ?? DEFAULT_USER_AGENT}`)

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
        puppeteer,
        path: chromePath,
        revision: '1108766',
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

  private parseCookies(textValue: string) {
    const httpOnlyRegExp = /^#HttpOnly_(.*)/
    return textValue
      .split(/\r\n|\n/)
      .filter(
        (line: string) =>
          line.trim() && (!line.startsWith('#') || httpOnlyRegExp.test(line)),
      )
      .map((line: string) => {
        const httpOnly = httpOnlyRegExp.test(line)
        if (httpOnly)
          line = line.replace(httpOnlyRegExp, '$1')

        const values = line.split(/\t/)
        if (values.length === 7) {
          return {
            domain: values[0],
            path: values[2],
            secure: values[3] === 'TRUE',
            expires: (values[4] && Number(values[4])) || undefined,
            name: values[5],
            value: values[6],
            httpOnly,
          }
        }
        return undefined
      })
      .filter((cookieData: any) => cookieData)
  }

  private async run(options: {
    url: any
    urlsFile: fs.PathOrFileDescriptor
    browserCookiesFile: fs.PathOrFileDescriptor
    browserCookies: (
      | {
        domain: string
        path: string
        secure: boolean
        expires: number | undefined
        name: string
        value: string
        httpOnly: boolean
      }
      | undefined
    )[]
  }) {
    const api = await import('single-file-cli/single-file-cli-api.js')

    let urls: any[]
    if (options.url && !api.VALID_URL_TEST.test(options.url))
      options.url = fileUrl(options.url)

    if (options.urlsFile)
      urls = fs.readFileSync(options.urlsFile).toString().split('\n')
    else urls = [options.url]

    if (options.browserCookiesFile) {
      const cookiesContent = fs
        .readFileSync(options.browserCookiesFile)
        .toString()
      try {
        options.browserCookies = JSON.parse(cookiesContent)
      }
      catch (error) {
        options.browserCookies = this.parseCookies(cookiesContent)
      }
    }
    const singlefile = await api.initialize(options)
    await singlefile.capture(urls)
    await singlefile.finish()
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
    try {
      let singleFilePath = 'single-file'
      try {
        const packageDir = await packageDirectory()
        if (packageDir) {
          const tempFilePath = path.resolve(
            packageDir,
            'node_modules',
            '.bin',
            'single-file',
          )
          await fsPromises.access(tempFilePath, constants.F_OK)
          singleFilePath = tempFilePath
        }
      }
      catch (error) {}

      const commands = [
        `--browser-args='${browserArgs}'`,
        url,
        `--output=${output}`,
        `--base-path=${basePath}`,
        `--user-agent="${this.browserOptions?.userAgent}"`,
        `--browser-headless=${this.browserOptions?.headless}`,
        `--browser-width=${this.browserOptions?.width}`,
        `--browser-height=${this.browserOptions?.height}`,
        `--http-proxy-server=${this.browserOptions?.httpProxy?.server ?? ''}`,
        `--http-proxy-username=${this.browserOptions?.httpProxy?.username ?? ''}`,
        `--http-proxy-password=${this.browserOptions?.httpProxy?.password ?? ''}`,
      ]
      if (this.browserServer) {
        commands.push(`--browser-server=${this.browserServer}`)
      }
      else {
        const browserExecutablePath = await this.getChromeExecutablePath()
        commands.push(`--browser-executable-path=${browserExecutablePath}`)
      }

      const { stderr } = await execFile(singleFilePath, commands)
      if (stderr)
        throw stderr
    }
    catch (error) {
      let args = await import('single-file-cli/args.js')
      args = args?.default ?? args
      const options = {
        ...args,
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

      await this.run(options)
    }
  }

  public save = async (
    url: string,
    folderPath?: string,
  ): Promise<SaveReturnType> => {
    try {
      if (!folderPath)
        folderPath = temporaryDirectory()

      await fsPromises.stat(folderPath)

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
        webpage: '',
        screenshot: '',
        title: '',
        timestamp: 0,
      }
    }
  }
}
