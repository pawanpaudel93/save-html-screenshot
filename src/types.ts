/**
 * Save Result
 */
export interface SaveResult {
  /** Indicates the status of the operation, either 'success' or 'error' */
  status: 'success' | 'error'
  /** Provides additional information or an error message if the operation failed */
  message: string
  /** The path where the HTML webpage and screenshot are saved */
  savedDirectory: string
  /** The path to the saved HTML webpage */
  webpage: string
  /** The path to the saved screenshot image */
  screenshot?: string
  /** The title of the captured webpage */
  title: string
  /** The timestamp of when the screenshot was captured (in seconds) */
  timestamp: number
}

/**
 * Options for the Browserless instance.
 */
export interface BrowserlessOptions {
  /** API key for accessing the browser service */
  apiKey: string
  /** Block ads on the page */
  blockAds?: boolean
  /** Enable stealth mode */
  stealth?: boolean
  /** Path to the user data directory */
  userDataDir?: string
  /** Keep the browser alive for the specified duration (in milliseconds) */
  keepalive?: number
  /** Comma-separated list of Chrome flags to ignore */
  ignoreDefaultArgs?: string
  /** Timeout in milliseconds for browser operations */
  timeout?: number
}

/**
 * Options for the HtmlScreenshotSaver.
 */
export interface HtmlScreenshotSaverOptions {
  /**
   * Path to where to save files (html, screenshot, and metadata), this path must exist.
   * @default ""
   */
  outputDirectory?: string
  /**
   * User agent of browser.
   * @default ""
   */
  userAgent?: string
  /**
   * Save screenshot or not.
   * @default false
   */
  saveScreenshot?: boolean
  /**
   * Accept Headers for font, image, stylesheet, script, and document.
   */
  acceptHeaders?: {
    font: string
    image: string
    stylesheet: string
    script: string
    document: string
  }
  /**
   * Block mixed contents.
   * @default false
   */
  blockMixedContent?: boolean
  /**
   * Server to connect to.
   * @default ""
   */
  browserServer?: string
  /**
   * Run the browser in headless mode.
   * @default true
   */
  browserHeadless?: boolean
  /**
   * Path to the browser executable.
   * @default ""
   */
  browserExecutablePath?: string
  /**
   * Width of the browser window.
   * @default 1280
   */
  browserWidth?: number
  /**
   * Height of the browser window.
   * @default 720
   */
  browserHeight?: number
  /**
   * Maximum time in milliseconds to wait for the page to load.
   * @default 60000
   */
  browserLoadMaxTime?: number
  /**
   * Delay in milliseconds to wait after the page has loaded.
   * @default 0
   */
  browserWaitDelay?: number
  /**
   * When to consider navigation as finished.
   * @default "networkidle0"
   */
  browserWaitUntil?: 'networkidle0' | 'networkidle2' | 'load' | 'domcontentloaded'
  /**
   * Retry with the next value of --browser-wait-until when a timeout error is thrown.
   * @default true
   */
  browserWaitUntilFallback?: boolean
  /**
   * Enable browser debugging.
   * @default false
   */
  browserDebug?: boolean
  /**
   * Arguments provided as a JSON array and passed to the browser.
   * @default ""
   */
  browserArgs?: string
  /**
   * Start the browser window minimized.
   * @default false
   */
  browserStartMinimized?: boolean
  /**
   * Path of the cookies file formatted as a JSON file or a Netscape text file.
   * @default ""
   */
  browserCookiesFile?: string
  /**
   * Ignore HTTPs errors.
   * @default false
   */
  browserIgnoreInsecureCerts?: boolean
  /**
   * Whether to compress CSS files.
   * @default false
   */
  compressCSS?: boolean
  /**
   * Whether to compress HTML files.
   * @default false
   */
  compressHTML?: boolean
  /**
   * Whether to dump the content of the page.
   * @default false
   */
  dumpContent?: boolean
  /**
   * Template used to generate the output filename (see help page of the extension for more info).
   * @default '{page-title} ({date-iso} {time-locale}).html'
   */
  filenameTemplate?: string
  /**
   * Action when the filename is conflicting with an existing one on the filesystem. The possible values are "uniquify" (default), "overwrite", and "skip".
   * @default "uniquify"
   */
  filenameConflictAction?: 'uniquify' | 'overwrite' | 'skip'
  /**
   * The character used for replacing invalid characters in filenames.
   * @default "_"
   */
  filenameReplacementCharacter?: string
  /**
   * Maximum length of the filename.
   * @default 192
   */
  filenameMaxLength?: number
  /**
   * Specify the unit of the maximum length of the filename ('bytes' or 'chars').
   * @default "bytes"
   */
  filenameMaxLengthUnit?: 'bytes' | 'chars'
  /**
   * Group duplicate images into CSS custom properties.
   * @default true
   */
  groupDuplicateImages?: boolean
  /**
   * Maximum size in bytes of duplicate images stored as CSS custom properties.
   * @default 524288
   */
  maxSizeDuplicateImages?: number
  /**
   * HTTP proxy server address.
   * @default ""
   */
  httpProxyServer?: string
  /**
   * Username for the HTTP proxy server.
   * @default ""
   */
  httpProxyUsername?: string
  /**
   * Password for the HTTP proxy server.
   * @default ""
   */
  httpProxyPassword?: string
  /**
   * Include an infobar at the top of the page.
   * @default false
   */
  includeInfobar?: boolean
  /**
   * Include a <meta> tag with a CSP to avoid potential requests to the internet when viewing a page.
   * @default true
   */
  insertMetaCsp?: boolean
  /**
   * Load deferred (a.k.a. lazy-loaded) images.
   * @default true
   */
  loadDeferredImages?: boolean
  /**
   * Dispatch 'scroll' event when loading deferred images.
   * @default false
   */
  loadDeferredImagesDispatchScrollEvent?: boolean
  /**
   * Maximum delay of time to wait for deferred images in ms.
   * @default 1500
   */
  loadDeferredImagesMaxIdleTime?: number
  /**
   * Load deferred images by keeping the page zoomed out.
   * @default false
   */
  loadDeferredImagesKeepZoomLevel?: boolean
  /**
   * Maximum number of browsers launched in parallel when processing a list of URLs.
   * @default 8
   */
  maxParallelWorkers?: number
  /**
   * Enable removal of embedded resources exceeding a given size.
   * @default false
   */
  maxResourceSizeEnabled?: boolean
  /**
   * Maximum size of embedded resources in MB (images, stylesheets, scripts, and iframes).
   * @default 10
   */
  maxResourceSize?: number
  /**
   * Move style elements outside the head element into the head element.
   * @default false
   */
  moveStylesInHead?: boolean
  /**
   * Remove HTML elements that are not displayed.
   * @default true
   */
  removeHiddenElements?: boolean
  /**
   * Remove unused CSS rules and unneeded declarations.
   * @default true
   */
  removeUnusedStyles?: boolean
  /**
   * Remove unused CSS font rules.
   * @default true
   */
  removeUnusedFonts?: boolean
  /**
   * Remove saved date metadata in HTML header.
   * @default false
   */
  removeSavedDate?: boolean
  /**
   * Remove frames from the page.
   * @default false
   */
  removeFrames?: boolean
  /**
   * Block execution of scripts.
   * @default true
   */
  blockScripts?: boolean
  /**
   * Block audio elements.
   * @default true
   */
  blockAudios?: boolean
  /**
   * Block video elements.
   * @default true
   */
  blockVideos?: boolean
  /**
   * Remove alternative fonts to the ones displayed.
   * @default true
   */
  removeAlternativeFonts?: boolean
  /**
   * Remove alternative CSS stylesheets.
   * @default true
   */
  removeAlternativeMedias?: boolean
  /**
   * Remove images for alternative sizes of the screen.
   * @default true
   */
  removeAlternativeImages?: boolean
  /**
   * Save the original page without interpreting it into the browser.
   * @default false
   */
  saveRawPage?: boolean
  /**
   * Enable the event API allowing to execute scripts before the page is saved.
   * @default true
   */
  userScriptEnabled?: boolean
  /**
   * Include the UTF-8 BOM into the HTML page.
   * @default false
   */
  includeBOM?: boolean
  /**
   * Crawl and save pages found via inner links.
   * @default false
   */
  crawlLinks?: boolean
  /**
   * Crawl pages found via inner links only if they are hosted on the same domain.
   * @default true
   */
  crawlInnerLinksOnly?: boolean
  /**
   * Max depth when crawling pages found in internal and external links (0: infinite).
   * @default 1
   */
  crawlMaxDepth?: number
  /**
   * Max depth when crawling pages found in external links (0: infinite).
   * @default 1
   */
  crawlExternalLinksMaxDepth?: number
  /**
   * Save background pages.
   * @default true
   */
  backgroundSave?: boolean
  /**
   * Replace URLs of saved pages with relative paths of saved pages on the filesystem.
   * @default false
   */
  crawlReplaceURLs?: boolean
  /**
   * Remove URL fragments found in links.
   * @default true
   */
  crawlRemoveURLFragment?: boolean
  /**
   * Include a <meta> tag with a Content Security Policy (CSP) to avoid potential requests to the internet when viewing a page.
   * @default true
   */
  insertMetaCSP?: boolean
  /**
   * Save the original URLs in the embedded contents.
   * @default false
   */
  saveOriginalURLs?: boolean
  /**
   * HTTP headers to include in requests.
   * @default {}
   */
  httpHeaders?: Record<string, string>
  /**
   * Ordered list of cookie parameters.
   * @default []
   */
  browserCookies?: string[]
  /**
   * Paths of scripts executed in the page before it is loaded.
   * @default []
   */
  browserScripts?: string[]
  /**
   * Paths of stylesheet files inserted into the page after it is loaded.
   * @default []
   */
  browserStylesheets?: string[]
  /**
   * Rewrite rules used to rewrite URLs of crawled pages.
   * @default []
   */
  crawlRewriteRules?: string[]
  /**
   * Media features to emulate in the browser.
   * @default []
   */
  emulateMediaFeatures?: string[]
  /**
   * Options for Browserless.
   * @default {}
   */
  browserlessOptions?: BrowserlessOptions
}
