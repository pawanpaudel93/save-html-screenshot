export interface SaveResult {
  status: 'success' | 'error'
  message: string
  savedFolderPath: string
  webpage: string
  screenshot?: string
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
  outputDirectory?: string
  userAgent?: string
  saveScreenshot?: boolean
  acceptHeaders?: {
    font: string
    image: string
    stylesheet: string
    script: string
    document: string
  }
  blockMixedContent?: boolean
  browserServer?: string
  browserHeadless?: boolean
  browserExecutablePath?: string
  browserWidth?: number
  browserHeight?: number
  browserLoadMaxTime?: number
  browserWaitDelay?: number
  browserWaitUntil?: 'networkidle0' | 'networkidle2' | 'load' | 'domcontentloaded'
  browserWaitUntilFallback?: boolean
  browserDebug?: boolean
  browserArgs?: string
  browserStartMinimized?: boolean
  browserCookiesFile?: string
  browserIgnoreInsecureCerts?: boolean
  compressCSS?: boolean
  compressHTML?: boolean
  dumpContent?: boolean
  filenameTemplate?: string
  filenameConflictAction?: 'uniquify' | 'overwrite' | 'skip'
  filenameReplacementCharacter?: string
  filenameMaxLength?: number
  filenameMaxLengthUnit?: 'bytes' | 'chars'
  groupDuplicateImages?: boolean
  maxSizeDuplicateImages?: number
  httpProxyServer?: string
  httpProxyUsername?: string
  httpProxyPassword?: string
  includeInfobar?: boolean
  insertMetaCsp?: boolean
  loadDeferredImages?: boolean
  loadDeferredImagesDispatchScrollEvent?: boolean
  loadDeferredImagesMaxIdleTime?: number
  loadDeferredImagesKeepZoomLevel?: boolean
  maxParallelWorkers?: number
  maxResourceSizeEnabled?: boolean
  maxResourceSize?: number
  moveStylesInHead?: boolean
  removeHiddenElements?: boolean
  removeUnusedStyles?: boolean
  removeUnusedFonts?: boolean
  removeSavedDate?: boolean
  removeFrames?: boolean
  blockScripts?: boolean
  blockAudios?: boolean
  blockVideos?: boolean
  removeAlternativeFonts?: boolean
  removeAlternativeMedias?: boolean
  removeAlternativeImages?: boolean
  saveOriginalUrls?: boolean
  saveRawPage?: boolean
  webDriverExecutablePath?: string
  userScriptEnabled?: boolean
  includeBOM?: boolean
  crawlLinks?: boolean
  crawlInnerLinksOnly?: boolean
  crawlRemoveUrlFragment?: boolean
  crawlMaxDepth?: number
  crawlExternalLinksMaxDepth?: number
  crawlReplaceUrls?: boolean
  backgroundSave?: boolean
  crawlReplaceURLs?: boolean
  crawlRemoveURLFragment?: boolean
  insertMetaCSP?: boolean
  saveOriginalURLs?: boolean
  httpHeaders?: Record<string, string>
  browserCookies?: string[]
  browserScripts?: string[]
  browserStylesheets?: string[]
  crawlRewriteRules?: string[]
  emulateMediaFeatures?: string[]
  browserlessOptions?: BrowserlessOptions
}
