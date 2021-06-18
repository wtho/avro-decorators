import 'reflect-metadata'
import { BaseFieldDecoratorArgs, InlineTypeDefinition } from '../types'
import {
  determineFieldMetadataFromProps,
  resolveInlineTypeDefinition,
  resolvePrimitiveRefOrRecordType,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from './decorator-utils'

describe('decorator-utils', () => {
  describe('storeAvroFieldReflectionMetadata', () => {
    test('stores avro-field metadata on target', () => {
      const setMetadata = {
        name: 'some-avro-name',
      } as any
      class TargetModel {}
      const target = TargetModel.prototype

      storeAvroFieldReflectionMetadata(setMetadata, target, 'fantasyKey')

      const retrievedMetadata = Reflect.getMetadata(
        'avro-field',
        target.constructor,
        'fantasyKey'
      )
      expect(retrievedMetadata).toEqual({ name: 'some-avro-name' })
    })

    test('stores avro-field-names metadata on target', () => {
      const setMetadata = {
        name: 'some-avro-name',
      } as any
      class TargetModel {}
      const target = TargetModel.prototype

      storeAvroFieldReflectionMetadata(setMetadata, target, 'fantasyKey')

      const retrievedMetadata = Reflect.getMetadata('avro-field-names', target.constructor)
      expect(retrievedMetadata).toEqual(['fantasyKey'])
    })

    test('does not store avro-field-names metadata on target if it is already stored', () => {
      const setMetadata = {
        name: 'some-avro-name',
      } as any
      class TargetModel {}
      const target = TargetModel.prototype
      Reflect.defineMetadata(
        'avro-field-names',
        ['fantasyKey', 'fantasyKey2'],
        target.constructor
      )

      storeAvroFieldReflectionMetadata(setMetadata, target, 'fantasyKey')

      const retrievedMetadata = Reflect.getMetadata('avro-field-names', target.constructor)
      expect(retrievedMetadata).toEqual(['fantasyKey', 'fantasyKey2'])
    })

    test('store additional avro-field-names metadata on target', () => {
      const setMetadata = {
        name: 'some-avro-name',
      } as any
      class TargetModel {}
      const target = TargetModel.prototype
      Reflect.defineMetadata('avro-field-names', ['key1', 'key2'], target.constructor)

      storeAvroFieldReflectionMetadata(setMetadata, target, 'fantasyKey')

      const retrievedMetadata = Reflect.getMetadata('avro-field-names', target.constructor)
      expect(retrievedMetadata).toEqual(['key1', 'key2', 'fantasyKey'])
    })
  })

  describe('storeAvroFieldTypeReflectionMetadata', () => {
    test('stores avro-type metadata on target', () => {
      const setMetadata = {
        typeName: 'some-avro-type',
      } as any
      class TargetModel {}
      const target = TargetModel.prototype

      storeAvroFieldTypeReflectionMetadata(setMetadata, target, 'fantasyKey')

      const retrievedMetadata = Reflect.getMetadata(
        'avro-field-type',
        target.constructor,
        'fantasyKey'
      )
      expect(retrievedMetadata).toEqual({ typeName: 'some-avro-type' })
    })

    test('stores avro-field-names metadata on target', () => {
      const setMetadata = {
        typeName: 'some-avro-type',
      } as any
      class TargetModel {}
      const target = TargetModel.prototype

      storeAvroFieldTypeReflectionMetadata(setMetadata, target, 'fantasyKey')

      const retrievedMetadata = Reflect.getMetadata('avro-field-names', target.constructor)
      expect(retrievedMetadata).toEqual(['fantasyKey'])
    })

    test('does not store avro-field-names metadata on target if it is already stored', () => {
      const setMetadata = {
        typeName: 'some-avro-type',
      } as any
      class TargetModel {}
      const target = TargetModel.prototype
      Reflect.defineMetadata(
        'avro-field-names',
        ['fantasyKey', 'fantasyKey2'],
        target.constructor
      )

      storeAvroFieldTypeReflectionMetadata(setMetadata, target, 'fantasyKey')

      const retrievedMetadata = Reflect.getMetadata('avro-field-names', target.constructor)
      expect(retrievedMetadata).toEqual(['fantasyKey', 'fantasyKey2'])
    })

    test('store additional avro-field-names metadata on target', () => {
      const setMetadata = {
        typeName: 'some-avro-type',
      } as any
      class TargetModel {}
      const target = TargetModel.prototype
      Reflect.defineMetadata('avro-field-names', ['key1', 'key2'], target.constructor)

      storeAvroFieldTypeReflectionMetadata(setMetadata, target, 'fantasyKey')

      const retrievedMetadata = Reflect.getMetadata('avro-field-names', target.constructor)
      expect(retrievedMetadata).toEqual(['key1', 'key2', 'fantasyKey'])
    })
  })

  describe('determineFieldMetadataFromProps', () => {
    test('determines minimal field metadata without name', () => {
      const props = {}

      const fieldMetadata = determineFieldMetadataFromProps('fieldName', props)

      expect(fieldMetadata).toEqual({ name: 'fieldName' })
    })

    test('determines full field metadata', () => {
      const props: BaseFieldDecoratorArgs<string> = {
        fieldAliases: ['alias1', 'alias2'],
        fieldDefault: 'default-string',
        fieldDoc: 'some useful description',
        nullable: false,
        order: 'ignore',
        fieldName: 'customFieldName',
      }

      const fieldMetadata = determineFieldMetadataFromProps('fieldName', props)

      expect(fieldMetadata).toEqual({
        name: 'customFieldName',
        doc: 'some useful description',
        default: 'default-string',
        order: 'ignore',
        aliases: ['alias1', 'alias2'],
      })
    })
  })

  describe('resolvePrimitiveRefOrRecordType', () => {
    test('resolves primitive defined type', () => {
      const ofType = 'string'

      const resolved = resolvePrimitiveRefOrRecordType(ofType)

      expect(resolved).toEqual({
        typeName: 'primitive-defined-type',
        primitiveDefinedType: 'string',
        nullable: false,
      })
    })

    test('resolves referenced defined type', () => {
      const ofType = 'SomeCustomRef'

      const resolved = resolvePrimitiveRefOrRecordType(ofType)

      expect(resolved).toEqual({
        typeName: 'referenced-defined-type',
        reference: 'SomeCustomRef',
        nullable: false,
      })
    })

    test('resolves record type', () => {
      class SomeRecord {}
      const ofType = () => SomeRecord

      const resolved = resolvePrimitiveRefOrRecordType(ofType)

      expect(resolved).toEqual({
        typeName: 'record-type',
        class: SomeRecord,
        nullable: false,
      })
    })
  })

  describe('resolveInlineTypeDefinition', () => {
    test('resolve primitive defined type', () => {
      const typeDef: InlineTypeDefinition = 'string'

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'primitive-defined-type',
        primitiveDefinedType: 'string',
        nullable: false,
      })
    })

    test('resolve referenced defined type', () => {
      const typeDef: InlineTypeDefinition = 'SomeRefType'

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'referenced-defined-type',
        reference: 'SomeRefType',
        nullable: false,
      })
    })

    test('resolve record type', () => {
      class SomeRecord {}
      const typeDef: InlineTypeDefinition = () => SomeRecord

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'record-type',
        class: SomeRecord,
        nullable: false,
      })
    })

    test('resolve minimally declared enum type', () => {
      const typeDef: InlineTypeDefinition = {
        enum: {
          name: 'EnumName',
          symbols: ['symbol1', 'symbol2'],
        },
      }

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'enum-type',
        name: 'EnumName',
        symbols: ['symbol1', 'symbol2'],
        nullable: false,
      })
    })

    test('resolve fully declared enum type', () => {
      const typeDef: InlineTypeDefinition = {
        enum: {
          name: 'EnumName',
          symbols: ['symbol1', 'symbol2'],
          typeAliases: ['alias1'],
          typeDefault: 'symbol1',
          typeDoc: 'just an enum',
          namespace: 'enum.namespace',
        },
      }

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'enum-type',
        name: 'EnumName',
        symbols: ['symbol1', 'symbol2'],
        nullable: false,
        aliases: ['alias1'],
        default: 'symbol1',
        doc: 'just an enum',
        namespace: 'enum.namespace',
      })
    })

    test('resolve minimally declared array type', () => {
      const typeDef: InlineTypeDefinition = {
        array: {
          items: 'string',
        },
      }

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'array-type',
        items: {
          typeName: 'primitive-defined-type',
          primitiveDefinedType: 'string',
          nullable: false,
        },
        nullable: false,
      })
    })

    test('resolve fully declared array type', () => {
      const typeDef: InlineTypeDefinition = {
        array: {
          items: 'string',
          default: [],
        },
      }

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'array-type',
        items: {
          typeName: 'primitive-defined-type',
          primitiveDefinedType: 'string',
          nullable: false,
        },
        default: [],
        nullable: false,
      })
    })

    test('resolve minimally declared map type', () => {
      const typeDef: InlineTypeDefinition = {
        map: {
          values: 'string',
        },
      }

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'map-type',
        values: {
          typeName: 'primitive-defined-type',
          primitiveDefinedType: 'string',
          nullable: false,
        },
        nullable: false,
      })
    })

    test('resolve fully declared map type', () => {
      const typeDef: InlineTypeDefinition = {
        map: {
          values: 'string',
          default: { Hello: 'world' },
        },
      }

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'map-type',
        values: {
          typeName: 'primitive-defined-type',
          primitiveDefinedType: 'string',
          nullable: false,
        },
        default: { Hello: 'world' },
        nullable: false,
      })
    })

    test('resolve minimally declared fixed type', () => {
      const typeDef: InlineTypeDefinition = {
        fixed: {
          name: 'FixedType',
          size: 8,
        },
      }

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'fixed-type',
        name: 'FixedType',
        size: 8,
        nullable: false,
        aliases: undefined,
        namespace: undefined,
      })
    })

    test('resolve fully declared fixed type', () => {
      const typeDef: InlineTypeDefinition = {
        fixed: {
          name: 'FixedType',
          size: 8,
          aliases: ['alias1'],
          namespace: 'some.fixed.namespace',
        },
      }

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'fixed-type',
        name: 'FixedType',
        size: 8,
        nullable: false,
        aliases: ['alias1'],
        namespace: 'some.fixed.namespace',
      })
    })

    test('resolve union type', () => {
      const typeDef: InlineTypeDefinition = {
        union: ['null', 'string', { fixed: { name: 'FixedType', size: 8 } }],
      }

      const resolved = resolveInlineTypeDefinition(typeDef)

      expect(resolved).toEqual({
        typeName: 'union-type',
        nullable: false,
        types: [
          {
            typeName: 'primitive-defined-type',
            primitiveDefinedType: 'null',
            nullable: false,
          },
          {
            typeName: 'primitive-defined-type',
            primitiveDefinedType: 'string',
            nullable: false,
          },
          {
            typeName: 'fixed-type',
            name: 'FixedType',
            size: 8,
            nullable: false,
            aliases: undefined,
            namespace: undefined,
          },
        ],
      })
    })

    test('throw on invalid type def', () => {
      const typeDef: any = {
        invalid: {}
      }

      expect(() => resolveInlineTypeDefinition(typeDef)).toThrowError('unknown inline type')
    })
  })
})
