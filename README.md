# save-html-screenshot

A node package that allows you to save HTML and screenshots of an URL. It utilizes the locally installed Chrome browser or [browserless.io](https://browserless.io) using Puppeteer to save the html and screenshot of the URL.

[![NPM version](https://img.shields.io/npm/v/save-html-screenshot?color=green&label=version)](https://www.npmjs.com/package/save-html-screenshot)

## Features

- Complete web page saving as a single HTML file.
- Option to save HTML and URL screenshots.
- Automatic Chrome browser download if not installed.
- Browserless.io supported.

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

See here on what options can be passed: [HtmlScreenshotSaverOptions](https://github.com/pawanpaudel93/save-html-screenshot/blob/fd689be68ceeb5eafc8622f6a1542843870de91d/src/types.ts#L44C1-L44C1)

### Save Method

The save method captures the html and screenshot of the specified URL and saves it to the specified folder path:

```ts
const result: SaveResult = await saver.save(url, options)
```

The `url` parameter is the URL of the webpage to capture.

The `options` parameter is optional with the following:

- `outputDirectory` (Optional): It specifies the folder path where the screenshot and related files will be saved. If not provided, a temporary directory will be used.
- `outputHtmlFilename` (Optional): Output HTML filename. If not provided, `index.html` will be used.
- `outputScreenshotFilename` (Optional): Output Screenshot filename. If not provided, `screenshot.png` will be used.

The method returns a `SaveResult` object with the following properties:

- `status`: Indicates the status of the operation, either 'success' or 'error'.
- `message`: Provides additional information or an error message if the operation failed.
- `savedDirectory`: The path where the HTML webpage and screenshot are saved.
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
const saveOptions = {
  outputDirectory: '/path/to/save',
  outputHtmlFilename: 'save.html',
  outputScreenshotFilename: 'save.png'
}

const options = {
  browserlessOptions: {
    apiKey,
  }
}

const saver = new HtmlScreenshotSaver(options)

const result = await saver.save(url, saveOptions)
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

const saver = new HtmlScreenshotSaver()

const result = saver.save(url)
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

## Related

- [single-file](https://github.com/pawanpaudel93/single-file)

## License

[MIT](./LICENSE) License © 2023 [Pawan Paudel](https://github.com/pawanpaudel93)
