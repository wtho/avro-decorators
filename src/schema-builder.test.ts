import 'reflect-metadata'
import {
  AvroArray,
  AvroEnum,
  AvroMap,
  AvroRecord,
  AvroString,
  AvroUnion,
  Record,
} from './decorators'
import { AvroFixed } from './decorators/avro-fixed.decorator'
import { AvroDecoratorsError } from './internals/avro-decorators.error'
import { avroSchemaFromClass } from './schema-builder'

describe('schema-builder', () => {
  describe('avroSchemaFromClass', () => {
    test('throws for non-class input', () => {
      expect(() => avroSchemaFromClass('no-class' as any)).toThrow(
        'Model does not seem to be a class - cannot parse metadata'
      )
    })

    test('throws for undecorated class', () => {
      class UndecoratedClass {}

      expect(() => avroSchemaFromClass(UndecoratedClass)).toThrow(
        'Could not create schema due to missing metadata on class: '
      )
    })

    test('throws for non-record root type', () => {
      class WrongModel {}
      Reflect.defineMetadata('avro-type', { someWrong: 'type' }, WrongModel)

      expect(() => avroSchemaFromClass(WrongModel)).toThrow(
        'Could not create schema due to missing metadata on class: class WrongModel {\n            }'
      )
    })

    test('returns simple record without fields', () => {
      @Record()
      class RecordModelNoFields {}

      const schema = avroSchemaFromClass(RecordModelNoFields)

      expect(schema).toEqual({
        type: 'record',
        fields: [],
        name: 'RecordModelNoFields',
      })
    })

    test('returns complex record with several fields', () => {
      @Record()
      class InnerRecordModel {}

      @Record({
        aliases: ['AlternateRecordName1', 'AlternateRecordName2'],
        description: 'This is just a record model with fields',
        namespace: 'test.models',
      })
      class RecordModelWithFields {
        @AvroString({
          nullable: true,
          fieldDoc: 'this is a string',
          fieldAliases: ['anotherStringField'],
          order: 'ascending',
          fieldDefault: null,
        })
        fieldString

        @AvroString()
        fieldStringSimple

        @AvroEnum({
          name: 'LowNumber',
          symbols: ['one', 'two', 'three'],
          fieldDoc: 'this is an enum field',
          fieldAliases: ['anotherEnumField'],
          typeAliases: ['AnotherEnumType'],
          typeDoc: 'this is an enum type',
          typeDefault: 'one',
          order: 'ascending',
          fieldDefault: 'three',
          namespace: 'enum.namespace',
        })
        fieldEnum

        @AvroEnum({ name: 'HighNumber', symbols: ['four', 'five', 'six'] })
        fieldEnumSimple

        @AvroRecord({
          ofType: () => InnerRecordModel,
          fieldDoc: 'this is a record',
          fieldAliases: ['anotherRecordField'],
          order: 'ascending',
          fieldDefault: {},
        })
        fieldRecord

        @AvroRecord({ ofType: () => InnerRecordModel })
        fieldRecordSimple
      }

      const schema = avroSchemaFromClass(RecordModelWithFields)

      expect(schema).toEqual({
        type: 'record',
        aliases: [ 'AlternateRecordName1', 'AlternateRecordName2' ],
        doc: 'This is just a record model with fields',
        namespace: 'test.models',
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
            doc: 'this is an enum field',
            name: 'fieldEnum',
            order: 'ascending',
            type: {
              aliases: ['AnotherEnumType'],
              default: 'one',
              doc: 'this is an enum type',
              type: 'enum',
              name: 'LowNumber',
              symbols: ['one', 'two', 'three'],
              namespace: 'enum.namespace',
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
        name: 'RecordModelWithFields',
      })
    })

    test('throws for primitive decorated el', () => {
      class PrimitiveModel {}
      Reflect.defineMetadata(
        'avro-type',
        { typeName: 'string' },
        PrimitiveModel
      )

      expect(() => avroSchemaFromClass(PrimitiveModel)).toThrowError(
        new AvroDecoratorsError(
          'Could not create schema due to missing metadata on class: class PrimitiveModel {\n            }'
        )
      )
    })

    test('throws for wrongly decorated record field', () => {
      @Record()
      class RecordModel {
        @AvroRecord({ ofType: () => null })
        innerInvalidRecordModel
      }

      expect(() => avroSchemaFromClass(RecordModel)).toThrowError(
        new AvroDecoratorsError(
          `Could not resolve schema for field 'innerInvalidRecordModel': Model does not seem to be a class - cannot parse metadata`
        )
      )
    })

    test('does not resolve field for wrongly decorated primitive field', () => {
      @Record()
      class Model {
        innerInvalidPrimitiveField: string
      }
      Reflect.defineMetadata(
        'avro-field-type',
        { typeName: 'primitive-defined-type', primitiveDefinedType: null },
        Model.constructor,
        'innerInvalidPrimitiveField'
      )

      expect(avroSchemaFromClass(Model)).toEqual({
        name: 'Model',
        type: 'record',
        fields: [],
      })
    })

    test('does prepend null for union not containing null type but being nullable', () => {
      @Record()
      class Model {
        @AvroUnion({ nullable: true }, ['string'])
        unionField: string | null
      }

      expect(avroSchemaFromClass(Model)).toEqual({
        name: 'Model',
        type: 'record',
        fields: [{ name: 'unionField', type: ['null', 'string'] }],
      })
    })

    test('does not add null for union already containing null type', () => {
      @Record()
      class Model {
        @AvroUnion({ nullable: true }, ['string', 'null'])
        unionField: string | null
      }

      expect(avroSchemaFromClass(Model)).toEqual({
        name: 'Model',
        type: 'record',
        fields: [{ name: 'unionField', type: ['string', 'null'] }],
      })
    })

    test('handles referenced types', () => {
      type RefType = unknown
      @Record()
      class Model {
        @AvroArray({ ofType: 'RefType' })
        arrayField: RefType[]
      }

      expect(avroSchemaFromClass(Model)).toEqual({
        name: 'Model',
        type: 'record',
        fields: [
          { name: 'arrayField', type: { type: 'array', items: 'RefType' } },
        ],
      })
    })

    test('handles defaults in array definition and field definition', () => {
      @Record()
      class Model {
        @AvroArray({
          ofType: 'string',
          fieldDefault: [],
          arrayDefault: ['default-val'],
        })
        arrayField: string[] = []
      }

      expect(avroSchemaFromClass(Model)).toEqual({
        name: 'Model',
        type: 'record',
        fields: [
          {
            name: 'arrayField',
            type: { type: 'array', items: 'string', default: ['default-val'] },
            default: [],
          },
        ],
      })
    })

    test('handles minimal map definition', () => {
      @Record()
      class Model {
        @AvroMap({
          ofType: 'string',
        })
        mapField: Record<string, string>
      }

      expect(avroSchemaFromClass(Model)).toEqual({
        name: 'Model',
        type: 'record',
        fields: [
          {
            name: 'mapField',
            type: {
              type: 'map',
              values: 'string',
            },
          },
        ],
      })
    })

    test('handles defaults and nullified in map definition', () => {
      @Record()
      class Model {
        @AvroMap({
          ofType: 'string',
          nullable: true,
          fieldDefault: {},
          mapDefault: { initial: 'default-val' },
        })
        mapField: Record<string, string> = { initial: 'default-val' }
      }

      expect(avroSchemaFromClass(Model)).toEqual({
        name: 'Model',
        type: 'record',
        fields: [
          {
            name: 'mapField',
            type: [
              'null',
              {
                type: 'map',
                values: 'string',
                default: { initial: 'default-val' },
              },
            ],
            default: {},
          },
        ],
      })
    })

    test('handles basic fixed type definition', () => {
      @Record()
      class Model {
        @AvroFixed({
          name: 'SomeFixed',
          size: 8,
        })
        fixedField: unknown
      }

      expect(avroSchemaFromClass(Model)).toEqual({
        name: 'Model',
        type: 'record',
        fields: [
          {
            name: 'fixedField',
            type: {
              type: 'fixed',
              size: 8,
              name: 'SomeFixed',
            },
          },
        ],
      })
    })

    test('handles fully declared fixed type definition', () => {
      @Record()
      class Model {
        @AvroFixed({
          name: 'SomeFixed',
          size: 8,
          fieldAliases: ['MyFixed'],
          fixedAliases: ['MyFixedTypeAlias'],
          fieldDefault: 'default-fixed',
          fieldDoc: 'This fixed field is 8 bytes long',
          namespace: 'some.namespace',
          nullable: true,
          order: 'descending',
          fieldName: 'customFieldName',
        })
        fixedField: unknown
      }

      expect(avroSchemaFromClass(Model)).toEqual({
        name: 'Model',
        type: 'record',
        fields: [
          {
            name: 'customFieldName',
            type: [
              'null',
              {
                type: 'fixed',
                size: 8,
                name: 'SomeFixed',
                namespace: 'some.namespace',
                aliases: ['MyFixedTypeAlias'],
              },
            ],
            aliases: ['MyFixed'],
            default: 'default-fixed',
            doc: 'This fixed field is 8 bytes long',
            order: 'descending',
          },
        ],
      })
    })

    test('throws when field type is unknown', () => {
      @Record()
      class Model {
        illegalTypeField: unknown
      }
      Reflect.defineMetadata('avro-field-names', ['illegal-type-field'], Model)
      Reflect.defineMetadata(
        'avro-field',
        { name: 'illegalTypeField' },
        Model,
        'illegal-type-field'
      )
      Reflect.defineMetadata(
        'avro-field-type',
        { typeName: 'illegal-type' },
        Model,
        'illegal-type-field'
      )

      expect(() => avroSchemaFromClass(Model)).toThrow(
        `Could not resolve schema for field 'illegalTypeField': The type name 'illegal-type' is unknown to avro decorators schema builder.`
      )
    })

    test('throws when field type is unknown without name', () => {
      @Record()
      class Model {
        illegalTypeField: unknown
      }
      Reflect.defineMetadata('avro-field-names', ['illegal-type-field'], Model)
      Reflect.defineMetadata(
        'avro-field',
        { name: 'illegalTypeField' },
        Model,
        'illegal-type-field'
      )
      Reflect.defineMetadata(
        'avro-field-type',
        { typeName: null },
        Model,
        'illegal-type-field'
      )

      expect(() => avroSchemaFromClass(Model)).toThrow(
        `Could not resolve schema for field 'illegalTypeField': The type name 'none' is unknown to avro decorators schema builder.`
      )
    })

    test('throws when field type is unknown without name', () => {
      @Record()
      class Model {
        illegalTypeField: unknown
      }

      jest.spyOn(Reflect, 'getMetadata').mockImplementationOnce(() => {
        throw new Error('random error')
      })

      expect(() => avroSchemaFromClass(Model)).toThrow(`random error`)
    })
  })
})
