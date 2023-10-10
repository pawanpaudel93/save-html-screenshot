/* eslint-disable no-console */
import fsPromises from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { HtmlScreenshotSaver } from '../src'

describe('Save html screenshot', () => {
  it('should save url html and screenshot with default', async () => {
    const saver = new HtmlScreenshotSaver({
      saveScreenshot: true,
    })
    const result = await saver.save('https://httpbin.org/ip')
    console.log(result)
    const files = await fsPromises.readdir(result.savedDirectory)
    const htmlFilename = files.find(file => file === 'index.html')
    const screenshotFilename = files.find(file => file === 'screenshot.png')

    expect(result.status).toEqual('success')
    expect(files.length).toBe(3)
    expect(htmlFilename).toBeDefined()
    expect(screenshotFilename).toBeDefined()

    await fsPromises.rm(result.savedDirectory, { recursive: true, force: true })
  })

  it('should save url html and screenshot with output options', async () => {
    const outputDirectory = 'output'
    const outputHtmlFilename = 'pawan.html'
    const outputScreenshotFilename = 'pawan.png'

    const saver = new HtmlScreenshotSaver({
      saveScreenshot: true,
      outputDirectory,
      outputHtmlFilename,
      outputScreenshotFilename,
    })
    const result = await saver.save('https://httpbin.org/headers')
    console.log(result)
    const files = await fsPromises.readdir(result.savedDirectory)
    const htmlFilename = files.find(file => file === outputHtmlFilename)
    const screenshotFilename = files.find(file => file === outputScreenshotFilename)

    expect(result.status).toEqual('success')
    expect(files.length).toBe(3)
    expect(htmlFilename).toBeDefined()
    expect(screenshotFilename).toBeDefined()

    await fsPromises.rm(result.savedDirectory, { recursive: true, force: true })
  })

  it('should save url html and screenshot with output options overriden in save method', async () => {
    const outputDirectory = 'output'
    const outputHtmlFilename = 'pawan.html'
    const outputScreenshotFilename = 'pawan.png'

    const overrideOutputDirectory = 'override'
    const overrideOutputHtmlFilename = 'override.html'
    const overrideOutputScreenshotFilename = 'override.png'

    const saver = new HtmlScreenshotSaver({
      saveScreenshot: true,
      outputDirectory,
      outputHtmlFilename,
      outputScreenshotFilename,
    })
    const result = await saver.save('https://httpbin.org/user-agent', {
      outputDirectory: overrideOutputDirectory,
      outputHtmlFilename: overrideOutputHtmlFilename,
      outputScreenshotFilename: overrideOutputScreenshotFilename,
    })
    console.log(result)
    const files = await fsPromises.readdir(result.savedDirectory)
    const htmlFilename = files.find(file => file === overrideOutputHtmlFilename)
    const screenshotFilename = files.find(file => file === overrideOutputHtmlFilename)

    expect(result.status).toEqual('success')
    expect(files.length).toBe(3)
    expect(htmlFilename).toBeDefined()
    expect(screenshotFilename).toBeDefined()

    await fsPromises.rm(result.savedDirectory, { recursive: true, force: true })
  })

  it('should save url html only', async () => {
    const outputHtmlFilename = 'pawan.html'
    const outputScreenshotFilename = 'pawan.png'

    const saver = new HtmlScreenshotSaver({
      saveScreenshot: false,
      outputHtmlFilename,
      outputScreenshotFilename,
    })
    const result = await saver.save('https://httpbin.org/uuid')
    console.log(result)
    const files = await fsPromises.readdir(result.savedDirectory)
    const htmlFilename = files.find(file => file === outputHtmlFilename)
    const screenshotFilename = files.find(file => file === outputScreenshotFilename)

    expect(result.status).toEqual('success')
    expect(files.length).toBe(2)
    expect(htmlFilename).toBeDefined()
    expect(screenshotFilename).toBeUndefined()

    await fsPromises.rm(result.savedDirectory, { recursive: true, force: true })
  })
}, 60000)
