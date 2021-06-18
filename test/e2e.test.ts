import { promises as fs } from 'fs'
import rimraf from 'rimraf'
import * as path from 'path'
import * as execa from 'execa'

describe('e2e', () => {

  beforeEach(async () => {
    await new Promise<void>((rs, rj) => rimraf(path.join(__dirname, '../schemas'), (err) => err ? rj() : rs()))
  })

  test(`run 'generate' for test-app-1 with config in root`, async () => {
    const command = 'node ../../build/bin/cli.js generate'
    const cwd = './test/test-app-1'

    const { stdout: output, stderr: errorOutput } = await execa.command(command, { cwd })

    expect(errorOutput).toEqual('')

    expect(output).toMatchSnapshot()
  })

  test(`run 'generate -c <config-path>' for test-app-1 with config in different folder`, async () => {
    const command =
      'node ../../build/bin/cli.js generate -c test-config-write-to-file.config.ts'
    const cwd = './test/test-app-1'

    const { stdout: output, stderr: errorOutput } = await execa.command(command, { cwd })

    const schema = (await fs.readFile(path.join(__dirname, 'test-app-1/schemas/Fruit.avsc'))).toString()

    expect(errorOutput).toEqual('')
    expect(output).toEqual('Writing 1 files...\n * wrote Fruit to Fruit.avsc')
    expect(schema).toMatchSnapshot()

  })
})
