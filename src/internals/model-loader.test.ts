import 'reflect-metadata'
import { Record } from '../decorators'
import { promises as fs } from 'fs'
const mkdirSpy = jest.spyOn(fs, 'mkdir')
const writeFileSpy = jest.spyOn(fs, 'writeFile')
import {
  getModels,
  isAvroDecoratedModel,
  printSchemas,
  stringifySchema,
  writeSchemas,
} from './model-loader'

const loggerMock = {
  debug: () => {},
  log: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

describe('model-loader', () => {
  describe('getModels', () => {
    test('returns empty list for empty model list input', async () => {
      const models = await getModels([])

      expect(models).toEqual([])
    })

    test('returns an invalid loaded test model', async () => {
      class TestModel {}
      await expect(getModels([{ class: TestModel }])).rejects.toThrow(
        'Could not create schema due to missing metadata on class:'
      )
    })

    test('returns one loaded test model', async () => {
      @Record()
      class TestModel {}
      const models = await getModels([{ class: TestModel }])

      expect(models).toEqual([
        {
          class: TestModel,
          fileName: 'TestModel.avsc',
          name: 'TestModel',
          schema: {
            fields: [],
            name: 'TestModel',
            type: 'record',
          },
          valid: true,
        },
      ])
    })
  })

  describe('isAvroDecoratedModel', () => {
    test('returns false for "null" input', () => {
      const isDecorated = isAvroDecoratedModel(null)
      expect(isDecorated).toBe(false)
    })

    test('returns false for undecorated class', () => {
      class TestModel {}
      const isDecorated = isAvroDecoratedModel(TestModel)
      expect(isDecorated).toBe(false)
    })

    test('returns false for wrongly decorated class', () => {
      class TestModel {}
      Reflect.defineMetadata('avro-type', {}, TestModel)
      const isDecorated = isAvroDecoratedModel(TestModel)
      expect(isDecorated).toBe(false)
    })

    test('returns true for correctly decorated class', () => {
      @Record()
      class TestModel {}
      const isDecorated = isAvroDecoratedModel(TestModel)
      expect(isDecorated).toBe(true)
    })
  })

  describe('writeSchemas', () => {
    test('returns and prints warning as it has no valid models to write', async () => {
      const loggerWarnSpy = jest.spyOn(loggerMock, 'warn')

      await writeSchemas([], '/home/jest/out/dir', loggerMock)

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'No valid models found to write'
      )
    })

    test('prints warning on only invalid models input', async () => {
      const loggerWarnSpy = jest.spyOn(loggerMock, 'warn')

      await writeSchemas(
        [{ valid: false }, { valid: false }] as any,
        '/home/jest/out/dir',
        loggerMock
      )

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'No valid models found to write'
      )
    })

    test('throws fs error', async () => {
      mkdirSpy.mockImplementation(() => {
        throw new Error('some fs error')
      })

      const schemasToWrite = [
        {
          valid: true,
          name: 'TestModel',
          fileName: 'test.avsc',
          schema: { type: 'int' },
        },
      ] as any

      await expect(() =>
        writeSchemas(schemasToWrite, '/home/jest/out/dir', loggerMock)
      ).rejects.toThrow('some fs error')
    })

    test('writes one schema', async () => {
      mkdirSpy.mockImplementation((() => {}) as any)
      writeFileSpy.mockImplementation((() => {}) as any)

      const schemasToWrite = [
        {
          valid: true,
          name: 'TestModel',
          fileName: 'test.avsc',
          schema: { type: 'int' },
        },
      ] as any

      await writeSchemas(schemasToWrite, '/home/jest/out/dir', loggerMock)

      expect(mkdirSpy).toHaveBeenCalledTimes(1)
      expect(mkdirSpy).toHaveBeenNthCalledWith(1, '/home/jest/out/dir', {
        recursive: true,
      })
      expect(writeFileSpy).toHaveBeenCalledTimes(1)
      expect(writeFileSpy).toHaveBeenNthCalledWith(
        1,
        '/home/jest/out/dir/test.avsc',
        '{\n  "type": "int"\n}\n'
      )
    })

    test('writes several schemas', async () => {
      mkdirSpy.mockImplementation((() => {}) as any)
      writeFileSpy.mockImplementation((() => {}) as any)

      const schemasToWrite = [
        {
          valid: true,
          name: 'TestModel',
          fileName: 'test.avsc',
          schema: { type: 'int' },
        },
        {
          valid: true,
          name: 'TestModel2',
          fileName: 'subfolder/test.avsc',
          schema: { type: 'boolean' },
        },
        {
          valid: true,
          name: 'TestModel3',
          fileName: 'test-3.avsc',
          schema: { type: 'string' },
        },
        {
          valid: true,
          name: 'TestModelWithoutFileName',
          schema: { type: 'boolean' },
        },
      ] as any

      await writeSchemas(schemasToWrite, '/home/jest/out/dir', loggerMock)

      expect(mkdirSpy).toHaveBeenCalledTimes(3)
      expect(mkdirSpy).toHaveBeenNthCalledWith(1, '/home/jest/out/dir', {
        recursive: true,
      })
      expect(mkdirSpy).toHaveBeenNthCalledWith(
        2,
        '/home/jest/out/dir/subfolder',
        { recursive: true }
      )
      expect(mkdirSpy).toHaveBeenNthCalledWith(3, '/home/jest/out/dir', {
        recursive: true,
      })
      expect(writeFileSpy).toHaveBeenCalledTimes(3)
      expect(writeFileSpy).toHaveBeenNthCalledWith(
        1,
        '/home/jest/out/dir/test.avsc',
        '{\n  "type": "int"\n}\n'
      )
      expect(writeFileSpy).toHaveBeenNthCalledWith(
        2,
        '/home/jest/out/dir/subfolder/test.avsc',
        '{\n  "type": "boolean"\n}\n'
      )
      expect(writeFileSpy).toHaveBeenNthCalledWith(
        3,
        '/home/jest/out/dir/test-3.avsc',
        '{\n  "type": "string"\n}\n'
      )
    })

    afterEach(() => jest.resetAllMocks())
  })

  describe('printSchemas', () => {
    test('prints warning on empty models input', () => {
      const loggerWarnSpy = jest.spyOn(loggerMock, 'warn')

      printSchemas([], loggerMock)

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'No valid models found to print'
      )
    })

    test('prints warning on only invalid models input', () => {
      const loggerWarnSpy = jest.spyOn(loggerMock, 'warn')

      printSchemas([{ valid: false }, { valid: false }] as any, loggerMock)

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'No valid models found to print'
      )
    })

    test('prints warning on a single valid model input', () => {
      const loggerLogSpy = jest.spyOn(loggerMock, 'log')

      printSchemas(
        [
          {
            valid: true,
            name: 'TestModel',
            fileName: 'test.avsc',
            schema: { type: 'int' },
          },
        ] as any,
        loggerMock
      )

      expect(loggerLogSpy).toHaveBeenCalledTimes(2)
      expect(loggerLogSpy).toHaveBeenNthCalledWith(
        1,
        `Printing schemas to stdout, as option 'outDir' is not set in config\n`
      )
      expect(loggerLogSpy).toHaveBeenLastCalledWith(
        `TestModel - test.avsc\n\n{\n  \"type\": \"int\"\n}\n\n\n`
      )
    })

    test('prints warning on a three valid models input', () => {
      const loggerLogSpy = jest.spyOn(loggerMock, 'log')

      printSchemas(
        [
          {
            valid: true,
            name: 'TestModel',
            fileName: 'test.avsc',
            schema: { type: 'int' },
          },
          { valid: true, name: 'TestModel2', schema: { type: 'boolean' } },
          {
            valid: true,
            name: 'TestModel3',
            fileName: 'test-3.avsc',
            schema: { type: 'string' },
          },
        ] as any,
        loggerMock
      )

      expect(loggerLogSpy).toHaveBeenCalledTimes(2)
      expect(loggerLogSpy).toHaveBeenNthCalledWith(
        1,
        `Printing schemas to stdout, as option 'outDir' is not set in config\n`
      )
      expect(loggerLogSpy).toHaveBeenLastCalledWith(
        `TestModel - test.avsc\n\n{\n  \"type\": \"int\"\n}\n\n\n\nTestModel2 - undefined\n\n{\n  \"type\": \"boolean\"\n}\n\n\n\nTestModel3 - test-3.avsc\n\n{\n  \"type\": \"string\"\n}\n\n\n`
      )
    })

    afterEach(() => jest.resetAllMocks())
  })

  describe('stringifySchema', () => {
    test('should just name type with simple string', () => {
      expect(stringifySchema('string')).toEqual('"string"\n')
    })

    test('should stringify a json object', () => {
      expect(stringifySchema({ type: 'int' })).toEqual(
        '{\n  "type": "int"\n}\n'
      )
    })
  })
})
