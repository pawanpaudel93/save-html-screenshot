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
  proxyServer?: string
  blockAds?: boolean
  stealth?: boolean
  userDataDir?: string
  keepalive?: number
  windowSize?: string
  ignoreDefaultArgs?: string
  headless?: boolean
  userAgent?: string
  timeout?: number
}

const USER_AGENT
  = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'

export class HtmlScreenshotSaver {
  private browserServer?: string

  constructor(browserlessOptions?: BrowserlessOptions) {
    this.processBrowserless(browserlessOptions)
  }

  private processBrowserless(options?: BrowserlessOptions) {
    if (options?.apiKey)
      this.browserServer = this.constructBrowserlessUrl(options)
  }

  private constructBrowserlessUrl(options: BrowserlessOptions): string {
    const {
      apiKey,
      proxyServer,
      blockAds,
      stealth,
      userDataDir,
      keepalive,
      windowSize,
      ignoreDefaultArgs,
      headless,
      userAgent,
      timeout,
    } = options

    let url = `wss://chrome.browserless.io/?token=${apiKey}`

    if (proxyServer)
      url += `&--proxy-server=${proxyServer}`

    if (blockAds)
      url += '&blockAds'

    if (stealth)
      url += '&stealth'

    if (userDataDir)
      url += `&--user-data-dir=${userDataDir}`

    if (keepalive)
      url += `&keepalive=${keepalive}`

    if (windowSize)
      url += `&--window-size=${windowSize}`

    if (ignoreDefaultArgs)
      url += `&ignoreDefaultArgs=${ignoreDefaultArgs}`

    if (headless !== undefined)
      url += `&headless=${headless}`

    if (timeout)
      url += `&timeout=${timeout}`

    url += `&user-agent=${userAgent || USER_AGENT}`

    return url
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
    browserArgs,
    url,
    basePath,
    output,
  }: {
    browserArgs: string
    url: string
    basePath: string
    output: string
  }) {
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
        `--user-agent="${USER_AGENT}"`,
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
        userAgent: USER_AGENT,
        browserWidth: 1920,
        browserHeight: 1080,
        browserServer: this.browserServer,
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
        browserArgs:
          '["--no-sandbox", "--window-size=1920,1080", "--start-maximized"]',
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
