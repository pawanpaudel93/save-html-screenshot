import fsPromises from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { HtmlScreenshotSaver } from '../src'

describe('should', () => {
  it('save url html and screenshot', async () => {
    const saver = new HtmlScreenshotSaver()
    const result = await saver.save('https://github.com/pawanpaudel93')
    // eslint-disable-next-line no-console
    console.log(result)
    expect(result.status).toEqual('success')
    await fsPromises.rm(result.webpage.replace('index.html', ''), { recursive: true, force: true })
  }, 60000)
})
