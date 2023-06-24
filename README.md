# save-html-screenshot

A node package that allows you to save HTML and screenshots of an URL. It utilizes the locally installed Chrome browser or [browserless.io](https://browserless.io) using Puppeteer to save the html and screenshot of the URL.

[![NPM version](https://img.shields.io/npm/v/save-html-screenshot?color=green&label=version)](https://www.npmjs.com/package/save-html-screenshot)

## Features

- Complete web page saving as a single HTML file.
- Option to save HTML and URL screenshots.
- Automatic Chrome browser download if not installed.
- Browserless functionality supported.

## Installation

You can install save-html-screenshot using npm:

```sh
npm install save-html-screenshot 
```

Using yarn:

```sh
yarn add save-html-screenshot 
```

And, using pnpm:

```sh
pnpm add save-html-screenshot 
```

## Usage

First, import the necessary modules:

```ts
import { HtmlScreenshotSaver, SaveResult } from 'save-html-screenshot'
```

### Constructor

Create an instance of the HtmlScreenshotSaver class with options:

```ts
const saver = new HtmlScreenshotSaver(options)
```

The `options` parameter is an object with the following properties:

- `headless` (optional): Set whether to run the browser in headless mode. Default: `true`
- `userAgent` (optional): Set a custom user agent. Default: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36`
- `width` (optional): Specify the window width. Default: `1920`
- `height` (optional): Specify the window height. Default: `1080`
- `httpProxy` (optional): An object with the following properties for proxy.
  - `server` (optional): The URL of the proxy server to use.
  - `username` (optional): The username of the proxy server to use.
  - `password` (optional): The password of the proxy server to use.
- `browserlessOptions` (optional): An object with the following properties
  - `apiKey` (required): Your browserless.io API key.
  - `blockAds` (optional): Enable ad-blocking.
  - `stealth` (optional): Enable stealth mode.
  - `userDataDir` (optional): Path to the user data directory.
  - `keepalive` (optional): Keep the browser session alive for a specified duration (in milliseconds).
  - `ignoreDefaultArgs` (optional): Specify a comma-separated list of Chrome flags to ignore.
  - `timeout` (optional): Set the timeout (in milliseconds) for requests.

### Save Method

The save method captures the html and screenshot of the specified URL and saves it to the specified folder path:

```ts
const result: SaveResult = await saver.save(url, outputDirectory)
```

The `url` parameter is the URL of the webpage to capture.

The `outputDirectory` parameter is optional and specifies the folder path where the screenshot and related files will be saved. If not provided, a temporary directory will be used.

The method returns a `SaveResult` object with the following properties:

- `status`: Indicates the status of the operation, either 'success' or 'error'.
- `message`: Provides additional information or an error message if the operation failed.
- `savedFoderPath`: The path where the HTML webpage and screenshot are saved.
- `webpage`: The path to the saved HTML webpage.
- `screenshot`: The path to the saved screenshot image.
- `title`: The title of the captured webpage.
- `timestamp`: The timestamp of when the screenshot was captured (in seconds).

## Example

Here's an example that demonstrates the usage of save-html-screenshot using browserless:

```ts
import { HtmlScreenshotSaver } from 'save-html-screenshot'

const apiKey = 'your-api-key'
const url = 'https://example.com'
const outputDirectory = '/path/to/save'

const options = {
  browserlessOptions: {
    apiKey,
  }
}

const saver = new HtmlScreenshotSaver(options)

const result = await saver.save(url, outputDirectory)
if (result.status === 'success') {
  console.log('Screenshot saved successfully!')
  console.log('Webpage:', result.webpage)
  console.log('Screenshot:', result.screenshot)
  console.log('Title:', result.title)
  console.log('Timestamp:', result.timestamp)
}
else {
  console.error('Error saving screenshot:', result.message)
}
```

In the above example, replace 'your-API-key' with your actual browserless.io API key and specify the desired URL and folder path.

Without using browserless,

```ts
import { HtmlScreenshotSaver } from 'save-html-screenshot'

const url = 'https://example.com'
const outputDirectory = '/path/to/save'

const saver = new HtmlScreenshotSaver()

const result = saver.save(url, outputDirectory)
if (result.status === 'success') {
  console.log('Screenshot saved successfully!')
  console.log('Webpage:', result.webpage)
  console.log('Screenshot:', result.screenshot)
  console.log('Title:', result.title)
  console.log('Timestamp:', result.timestamp)
}
else {
  console.error('Error saving screenshot:', result.message)
}
```

## License

[MIT](./LICENSE) License © 2023 [Pawan Paudel](https://github.com/pawanpaudel93)
