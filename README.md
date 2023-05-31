# save-html-screenshot

A nodejs package that allows you to save html and screenshot of an url. It utilizes the locally installed Chrome browser or [browserless.io](https://browserless.io) using puppeteer to save the html and screenshot of the url.

[![NPM version](https://img.shields.io/npm/v/save-html-screenshot?color=a1b858&label=)](https://www.npmjs.com/package/save-html-screenshot)

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
import { HtmlScreenshotSaver, SaveReturnType } from 'save-html-screenshot'
```

### Constructor

Create an instance of the HtmlScreenshotSaver class with optional browserlessOptions:

```ts
const saver = new HtmlScreenshotSaver(browserlessOptions)
```

The `browserlessOptions` parameter is an object with the following properties:

- `apiKey` (required): Your browserless.io API key.
- `proxyServer` (optional): The URL of the proxy server to use.
- `blockAds` (optional): Enable ad-blocking.
- `stealth` (optional): Enable stealth mode.
- `userDataDir` (optional): Path to the user data directory.
- `keepalive` (optional): Keep the browser session alive for a specified duration (in milliseconds).
- `windowSize` (optional): Specify the window size in the format width,height.
- `ignoreDefaultArgs` (optional): Specify a comma-separated list of Chrome flags to ignore.
- `headless` (optional): Set whether to run the browser in headless mode.
- `userAgent` (optional): Set a custom user agent.
- `timeout` (optional): Set the timeout (in milliseconds) for requests.

### Save Method

The save method captures the html and screenshot of the specified URL and saves it to the specified folder path:

```ts
const result: SaveReturnType = await saver.save(url, folderPath)
```

The `url` parameter is the URL of the webpage to capture.

The `folderPath` parameter is optional and specifies the folder path where the screenshot and related files will be saved. If not provided, a temporary directory will be used.

The method returns a `SaveReturnType` object with the following properties:

- `status`: Indicates the status of the operation, either 'success' or 'error'.
- `message`: Provides additional information or an error message if the operation failed.
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
const folderPath = '/path/to/save'

const browserlessOptions = {
  apiKey,
  headless: true,
  windowSize: '1920,1080'
}

const saver = new HtmlScreenshotSaver(browserlessOptions)

saver.save(url, folderPath)
  .then((result) => {
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
  })
  .catch((error) => {
    console.error('An error occurred:', error)
  })
```

In the above example, replace 'your-api-key' with your actual browserless.io API key and specify the desired URL and folder path.

Without using browserless,

```ts
import { HtmlScreenshotSaver } from 'save-html-screenshot'

const url = 'https://example.com'
const folderPath = '/path/to/save'

const saver = new HtmlScreenshotSaver()

saver.save(url, folderPath)
  .then((result) => {
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
  })
  .catch((error) => {
    console.error('An error occurred:', error)
  })
```

## License

[MIT](./LICENSE) License © 2023 [Pawan Paudel](https://github.com/pawanpaudel93)
