import 'reflect-metadata'
import { AvroEnum, AvroRecord, AvroString, Record } from '../decorators'
import { avroSchemaFromClass } from './schema-builder'

describe('schema-builder', () => {
  describe('avroSchemaFromClass', () => {
    test('throws for non-class input', () => {
      expect(() => avroSchemaFromClass('no-class' as any)).toThrow('Could not create schema from class: no-class')
    })

    test('throws for undecorated class', () => {
      class UndecoratedClass {}

      expect(() => avroSchemaFromClass(UndecoratedClass)).toThrow('Could not create schema due to missing metadata on class: ')
    })

    test('throws for non-record root type', () => {
      class EnumModel {}
      Reflect.defineMetadata('avro-type', { typeName: 'enum' }, EnumModel)

      expect(() => avroSchemaFromClass(EnumModel)).toThrow('A schema built root type must be record, not enum')
    })

    test('returns simple record without fields', () => {
      @Record()
      class RecordModel {}

      const schema = avroSchemaFromClass(RecordModel)

      expect(schema).toEqual({
        type: 'record',
        fields: [],
        name: 'RecordModel',
      })
    })

    test('returns complex record with several fields', () => {
      @Record()
      class InnerRecordModel {}

      @Record()
      class RecordModel {
        @AvroString({
          nullable: true,
          description: 'this is a string',
          aliases: ['anotherStringField'],
          order: 'ascending',
          default: null,
        })
        fieldString

        @AvroString()
        fieldStringSimple

        @AvroEnum({
          name: 'LowNumber',
          symbols: ['one', 'two', 'three'],
          description: 'this is an enum',
          aliases: ['anotherEnumField'],
          order: 'ascending',
          default: 'three',
        })
        fieldEnum

        @AvroEnum({ name: 'HighNumber', symbols: ['four', 'five', 'six'] })
        fieldEnumSimple

        @AvroRecord({
          ofType: () => InnerRecordModel,
          description: 'this is a record',
          aliases: ['anotherRecordField'],
          order: 'ascending',
          default: {},
        })
        fieldRecord

        @AvroRecord({ ofType: () => InnerRecordModel })
        fieldRecordSimple
      }

      const schema = avroSchemaFromClass(RecordModel)

      expect(schema).toEqual({
        type: 'record',
        fields: [
          {
            aliases: ['anotherStringField'],
            doc: 'this is a string',
            default: null,
            name: 'fieldString',
            order: 'ascending',
            type: ['null', 'string'],
          },
          {
            name: 'fieldStringSimple',
            type: 'string',
          },
          {
            aliases: ['anotherEnumField'],
            default: 'three',
            doc: 'this is an enum',
            name: 'fieldEnum',
            order: 'ascending',
            type: {
              type: 'enum',
              name: 'LowNumber',
              symbols: ['one', 'two', 'three'],
            },
          },
          {
            name: 'fieldEnumSimple',
            type: {
              type: 'enum',
              name: 'HighNumber',
              symbols: ['four', 'five', 'six'],
            },
          },
          {
            aliases: ['anotherRecordField'],
            doc: 'this is a record',
            default: {},
            name: 'fieldRecord',
            order: 'ascending',
            type: {
              type: 'record',
              fields: [],
              name: 'InnerRecordModel',
            },
          },
          {
            name: 'fieldRecordSimple',
            type: {
              type: 'record',
              fields: [],
              name: 'InnerRecordModel',
            },
          },
        ],
        name: 'RecordModel',
      })
    })

    test('returns primitive type for primitive decorated el', () => {
      class PrimitiveModel {}
      Reflect.defineMetadata(
        'avro-type',
        { typeName: 'string' },
        PrimitiveModel
      )

      const schema = avroSchemaFromClass(PrimitiveModel)

      expect(schema).toEqual({ type: 'string' })
    })

    test('returns primitive type for primitive decorated el', () => {
      // class InnerInvalidRecordModel {}
      // Reflect.defineMetadata('avro-type', { typeName: 'string' }, InnerInvalidRecordModel)
      @Record()
      class RecordModel {
        @AvroRecord({ ofType: () => null })
        innerInvalidRecordModel
      }

      const schema = avroSchemaFromClass(RecordModel)

      expect(schema).toEqual({
        type: 'record',
        name: 'RecordModel',
        fields: [
          { name: 'innerInvalidRecordModel', type: undefined },
        ],
      })
    })
  })
})
