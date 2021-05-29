import 'reflect-metadata'
import { Record } from '../decorators'
import { AvroDecoratorsError } from './avro-decorators.error'

const mockedFilePaths = {}

jest.mock('./path-utils', () => ({
  absolute: (filePath: string) => mockedFilePaths[filePath]
}))

import { loadConfig, parseArgs, validateConfig } from './config-loader'

describe('config-loader', () => {
  describe('validateConfig', () => {
    test('throws avro decorators error if config is empty', async () => {
      expect(() => validateConfig(null, 'some-test-path')).toThrowError(
        new AvroDecoratorsError(
          `ERROR: Config at 'some-test-path' does not default-export an object like so:\n\nconst config = {};\nexport default config\n`
        )
      )
    })

    test('throws avro decorators error if config is empty', async () => {
      expect(() =>
        validateConfig('no-object' as any, 'some-test-path')
      ).toThrowError(
        new AvroDecoratorsError(
          `ERROR: Config at 'some-test-path' does not default-export an object like so:\n\nconst config = {};\nexport default config\n`
        )
      )
    })

    test('throws avro decorators error if config has no models field', async () => {
      expect(() => validateConfig({} as any, 'some-test-path')).toThrowError(
        new AvroDecoratorsError(
          `The configuration loaded from some-test-path contains some errors:\n* 'models' must be defined in config`
        )
      )
    })

    test('throws avro decorators error if models field is no array', async () => {
      expect(() =>
        validateConfig({ models: {} as any }, 'some-test-path')
      ).toThrowError(
        new AvroDecoratorsError(
          `The configuration loaded from some-test-path contains some errors:\n* 'models' defined in config must be an array`
        )
      )
    })

    test('throws avro decorators error if models field is an empty array', async () => {
      expect(() =>
        validateConfig({ models: [] }, 'some-test-path')
      ).toThrowError(
        new AvroDecoratorsError(
          `The configuration loaded from some-test-path contains some errors:\n* 'models' defined in config cannot be an empty array`
        )
      )
    })

    test('throws avro decorators error if model does not contain class', async () => {
      expect(() =>
        validateConfig({ models: [{} as any] }, 'some-test-path')
      ).toThrowError(
        new AvroDecoratorsError(
          `The configuration loaded from some-test-path contains some errors:\n* 'models[0].class' must be defined`
        )
      )
    })

    test('throws avro decorators error if model does contain object instead of class', async () => {
      expect(() =>
        validateConfig({ models: [{ class: {} } as any] }, 'some-test-path')
      ).toThrowError(
        new AvroDecoratorsError(
          `The configuration loaded from some-test-path contains some errors:\n* 'models[0].class' must be a class`
        )
      )
    })

    test('throws avro decorators error if model does contain undecorated class', async () => {
      expect(() =>
        validateConfig(
          { models: [{ class: class SomeTestClass {} }] },
          'some-test-path'
        )
      ).toThrowError(
        new AvroDecoratorsError(
          `The configuration loaded from some-test-path contains some errors:\n* 'models[0].class' must be a model decorated with the avro decorator '@Record(...)'`
        )
      )
    })

    test('throws avro decorators error if model has non-string avscFileName', async () => {
      @Record()
      class SomeTestClass {}
      expect(() =>
        validateConfig(
          { models: [{ class: SomeTestClass, avscFileName: {} as any }] },
          'some-test-path'
        )
      ).toThrowError(
        new AvroDecoratorsError(
          `The configuration loaded from some-test-path contains some errors:\n* if defined, 'models[0].avscFileName' must be a string`
        )
      )
    })

    test('throws avro decorators error if outDir is non-string', async () => {
      @Record()
      class SomeTestClass {}
      expect(() =>
        validateConfig(
          { models: [{ class: SomeTestClass }], outDir: {} as any },
          'some-test-path'
        )
      ).toThrowError(
        new AvroDecoratorsError(
          `The configuration loaded from some-test-path contains some errors:\n* if defined, 'outDir' must be a string`
        )
      )
    })

    test('passes with for valid config', async () => {
      @Record()
      class SomeTestClass {}
      expect(
        validateConfig(
          {
            models: [{ class: SomeTestClass, avscFileName: 'some-test.avsc' }],
            outDir: './out',
          },
          'some-test-path'
        )
      ).toBeUndefined()
    })
  })

  describe('parseYargs', () => {
    test(`exits on empty args "" due to missing command`, async () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exit')
      })

      expect(() => parseArgs([])).toThrow('process exit')

      expect(mockExit).toHaveBeenCalledWith(1)
    })

    test(`exits on args "-c config.ts" due to missing command`, async () => {
      const input = '-c config.ts'
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exit')
      })

      expect(() => parseArgs(input.split(' '))).toThrow('process exit')

      expect(mockExit).toHaveBeenCalledWith(1)
    })

    test(`throws error on input "invalidcommand"`, async () => {
      const input = 'invalidcommand'
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exit')
      })

      expect(() => parseArgs(input.split(' '))).toThrow('process exit')
      expect(mockExit).toHaveBeenCalledWith(1)
    })

    test(`throws error on input "unknowncommand generate "`, async () => {
      const input = 'generate toomanycommands'
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process exit')
      })

      expect(() => parseArgs(input.split(' '))).toThrow('process exit')

      expect(mockExit).toHaveBeenCalledWith(1)
    })

    test(`parses args successfully on "generate"`, async () => {
      const input = 'generate'

      const parsed = parseArgs(input.split(' '))

      expect(parsed.command).toBe('generate')
    })

    afterEach(() => jest.resetAllMocks())
  })

  describe('loadConfig', () => {
    test('loads default config', async () => {
      @Record()
      class TestModel {}
      const mockConfig = {
        default: {
          models: [{ class: TestModel }],
        },
      }
      mockedFilePaths['avro-decorators.config.ts'] = '/home/jest/path-test-1/avro-decorators.config.ts'
      jest.mock('/home/jest/path-test-1/avro-decorators.config.ts', () => mockConfig, { virtual: true })

      const { config } = loadConfig()

      expect(config).toBe(mockConfig.default)
    })

    test('loads default config without default export', async () => {
      @Record()
      class TestModel {}
      const mockConfig = {
        models: [{ class: TestModel }],
      }
      mockedFilePaths['avro-decorators.config.ts'] = '/home/jest/path-test-2/avro-decorators.config.ts'
      jest.mock('/home/jest/path-test-2/avro-decorators.config.ts', () => mockConfig, { virtual: true })

      const { config } = loadConfig()

      expect(config).toBe(mockConfig)
    })

    test('loads config with ts compile error', async () => {
      const throwTsError = () => {
        const tsError: any = new Error('Oh no - some TS error!')
        tsError.name = 'TSError'
        throw tsError
      }
      mockedFilePaths['avro-decorators.config.ts'] = '/home/jest/path-test-3/avro-decorators.config.ts'
      jest.mock('/home/jest/path-test-3/avro-decorators.config.ts', () => throwTsError(), { virtual: true })

      expect(() => loadConfig()).toThrow(new AvroDecoratorsError(`Could not load config file from /home/jest/path-test-3/avro-decorators.config.ts due to TypeScript compilation error:\nOh no - some TS error!`))
    })

    test('loads config with a random error', async () => {
      mockedFilePaths['avro-decorators.config.ts'] = '/home/jest/path-test-4/avro-decorators.config.ts'
      jest.mock('/home/jest/path-test-4/avro-decorators.config.ts', () => { throw new Error('Oh no - some error!') }, { virtual: true })

      expect(() => loadConfig()).toThrow(new AvroDecoratorsError(`Could not load config file from /home/jest/path-test-4/avro-decorators.config.ts\n\nOh no - some error!`))
    })

    test('loads config successfully', async () => {
      @Record()
      class TestModel {}
      const mockConfig = {
        default: {
          models: [{ class: TestModel }],
        }
      }
      mockedFilePaths['my-config.ts'] = '/home/jest/path-test-5/my-config.ts'
      jest.mock('/home/jest/path-test-5/my-config.ts', () => mockConfig, { virtual: true })

      const { config } = loadConfig('my-config.ts')

      expect(config).toBe(mockConfig.default)
    })

    test('adjusts outDir', async () => {
      @Record()
      class TestModel {}
      const mockConfig = {
        default: {
          models: [{ class: TestModel }],
          outDir: 'relative/path'
        }
      }
      mockedFilePaths['my-config.ts'] = '/home/jest/path-test-6/my-config.ts'
      mockedFilePaths['relative/path'] = '/home/jest/path-test-6/relative/path'
      jest.mock('/home/jest/path-test-6/my-config.ts', () => mockConfig, { virtual: true })

      const { config } = loadConfig('my-config.ts')

      expect(config.outDir).toBe('/home/jest/path-test-6/relative/path')
    })

    afterEach(() => jest.resetAllMocks())
  })
})
