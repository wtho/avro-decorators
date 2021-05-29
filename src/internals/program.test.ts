const configLoaderMock = {
  loadConfig: () => {},
  parseArgs: () => {},
}
const modelLoaderMock = {
  getModels: () => [],
  printSchemas: () => {},
  writeSchemas: () => {},
}
const processMock = {
  exit: (code?: number) => {},
}

jest.mock('../internals/model-loader', () => modelLoaderMock, { virtual: true })
jest.mock('../internals/config-loader', () => configLoaderMock, {
  virtual: true,
})
import { AvroDecoratorsError } from './avro-decorators.error'
import { runAvroDecorators } from './program'

describe('program › runAvroDecorators', () => {
  test('should run basic generate without models', async () => {
    const parseArgsSpy = jest
      .spyOn(configLoaderMock, 'parseArgs')
      .mockImplementation(() => ({
        parsedYargs: { argv: { config: 'config-path.ts' } },
        command: 'generate',
      }))
    const loadConfigSpy = jest
      .spyOn(configLoaderMock, 'loadConfig')
      .mockImplementation(() => ({ config: { models: [] } }))
    const getModelsSpy = jest
      .spyOn(modelLoaderMock, 'getModels')
      .mockImplementation(() => [])
    const printSchemasSpy = jest
      .spyOn(modelLoaderMock, 'printSchemas')
      .mockImplementation(() => {})

    await runAvroDecorators(
      ['cwd', 'program-name', 'generate'],
      (() => {}) as any,
      console
    )

    expect(parseArgsSpy).toHaveBeenCalledWith(['generate'])
    expect(loadConfigSpy).toHaveBeenCalledWith('config-path.ts')
    expect(getModelsSpy).toHaveBeenCalledWith([])
    expect(printSchemasSpy).toHaveBeenCalledWith([], console)
  })

  test('should run basic generate with models written to file', async () => {
    const parseArgsSpy = jest
      .spyOn(configLoaderMock, 'parseArgs')
      .mockImplementation(() => ({
        parsedYargs: { argv: { config: 'config-path.ts' } },
        command: 'generate',
      }))
    const loadConfigSpy = jest
      .spyOn(configLoaderMock, 'loadConfig')
      .mockImplementation(() => ({
        config: { outDir: 'some/outdir', models: [{ some: 'model' }] },
      }))
    const getModelsSpy = jest
      .spyOn(modelLoaderMock, 'getModels')
      .mockImplementation(() => [{ a: { loaded: 'model' } }])
    const writeSchemasSpy = jest
      .spyOn(modelLoaderMock, 'writeSchemas')
      .mockImplementation(() => {})

    await runAvroDecorators(
      ['cwd', 'program-name', 'generate'],
      (() => {}) as any,
      console
    )

    expect(parseArgsSpy).toHaveBeenCalledWith(['generate'])
    expect(loadConfigSpy).toHaveBeenCalledWith('config-path.ts')
    expect(getModelsSpy).toHaveBeenCalledWith([{ some: 'model' }])
    expect(writeSchemasSpy).toHaveBeenCalledWith(
      [{ a: { loaded: 'model' } }],
      'some/outdir',
      console
    )
  })

  test('a unknown command should not call writeSchema or printSchema', async () => {
    const parseArgsSpy = jest
      .spyOn(configLoaderMock, 'parseArgs')
      .mockImplementation(() => ({
        parsedYargs: { argv: { config: 'config-path.ts' } },
        command: 'unknown-command',
      }))
    const loadConfigSpy = jest
      .spyOn(configLoaderMock, 'loadConfig')
      .mockImplementation(() => ({ config: { models: [] } }))
    const getModelsSpy = jest
      .spyOn(modelLoaderMock, 'getModels')
      .mockImplementation(() => [])
    const writeSchemasSpy = jest.spyOn(modelLoaderMock, 'writeSchemas')
    const printSchemasSpy = jest.spyOn(modelLoaderMock, 'printSchemas')

    await runAvroDecorators(
      ['cwd', 'program-name', 'unknown-command'],
      (() => {}) as any,
      console
    )

    expect(parseArgsSpy).toHaveBeenCalledWith(['unknown-command'])
    expect(loadConfigSpy).toHaveBeenCalledWith('config-path.ts')
    expect(getModelsSpy).toHaveBeenCalledWith([])
    expect(writeSchemasSpy).toHaveBeenCalledTimes(0)
    expect(printSchemasSpy).toHaveBeenCalledTimes(0)
  })

  test('re-throws non-avro-decorator-error which occurs on config load', async () => {
    const parseArgsSpy = jest
      .spyOn(configLoaderMock, 'parseArgs')
      .mockImplementation(() => ({
        parsedYargs: { argv: { config: 'config-path.ts' } },
        command: 'unknown-command',
      }))
    const loadConfigSpy = jest
      .spyOn(configLoaderMock, 'loadConfig')
      .mockImplementation(() => {
        throw new Error('ordinary error')
      })
    const getModelsSpy = jest.spyOn(modelLoaderMock, 'getModels')

    await expect(() =>
      runAvroDecorators(
        ['cwd', 'program-name', 'unknown-command'],
        (() => {}) as any,
        console
      )
    ).rejects.toThrow('ordinary error')

    expect(getModelsSpy).toHaveBeenCalledTimes(0)
  })

  test('exits process on avro-decorator-error', async () => {
    const parsedYargsMock = {
      showHelp: () => {},
      argv: { config: 'config-path.ts' },
    }
    const showHelpSpy = jest.spyOn(parsedYargsMock, 'showHelp')
    const processExitSpy = jest.spyOn(processMock, 'exit')
    const parseArgsSpy = jest
      .spyOn(configLoaderMock, 'parseArgs')
      .mockImplementation(() => ({
        parsedYargs: parsedYargsMock,
        command: 'unknown-command',
      }))
    const loadConfigSpy = jest
      .spyOn(configLoaderMock, 'loadConfig')
      .mockImplementation(() => {
        throw new AvroDecoratorsError('decorator error')
      })
    const getModelsSpy = jest.spyOn(modelLoaderMock, 'getModels')

    await expect(() =>
      runAvroDecorators(
        ['cwd', 'program-name', 'unknown-command'],
        processMock.exit as any,
        console
      )
    ).rejects.toThrow()

    expect(getModelsSpy).toHaveBeenCalledTimes(0)
    expect(showHelpSpy).toHaveBeenCalledTimes(0)
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })

  test('exits process on avro-decorator-error and prints help', async () => {
    const parsedYargsMock = {
      showHelp: () => {},
      argv: { config: 'config-path.ts' },
    }
    const showHelpSpy = jest.spyOn(parsedYargsMock, 'showHelp')
    const processExitSpy = jest.spyOn(processMock, 'exit')
    const parseArgsSpy = jest
      .spyOn(configLoaderMock, 'parseArgs')
      .mockImplementation(() => ({
        parsedYargs: parsedYargsMock,
        command: 'unknown-command',
      }))
    const loadConfigSpy = jest
      .spyOn(configLoaderMock, 'loadConfig')
      .mockImplementation(() => {
        throw new AvroDecoratorsError('decorator error', true)
      })
    const getModelsSpy = jest.spyOn(modelLoaderMock, 'getModels')

    await expect(() =>
      runAvroDecorators(
        ['cwd', 'program-name', 'unknown-command'],
        processMock.exit as any,
        console
      )
    ).rejects.toThrow()

    expect(getModelsSpy).toHaveBeenCalledTimes(0)
    expect(showHelpSpy).toHaveBeenCalledWith('error')
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })

  afterEach(() => jest.resetAllMocks())
})
