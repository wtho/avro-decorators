import {
  getPrimitiveAvroType,
  getSchemaStringName,
  isArraySchema,
  isComplexNamedSchema,
  isComplexSchema,
  isEnumSchema,
  isFixedSchema,
  isMapSchema,
  isPrimitiveType,
  isRecordSchema,
  isSchemaValid,
  isUnionSchema,
} from './avro-helper'

describe('avro-helper', () => {

  describe('isSchemaValid', () => {
    test('returns false for null input', () => {
      expect(isSchemaValid(null)).toBe(false)
    })

    test('returns false for invalid record schema', () => {
      expect(isSchemaValid({ type: 'record' } as any)).toBe(false)
    })

    test('returns false referenced schema input', () => {
      expect(isSchemaValid('MyLongList')).toBe(false)
    })

    test('returns true for valid primitive string input', () => {
      expect(isSchemaValid('int')).toBe(true)
    })

    test('returns true for valid primitive object input', () => {
      expect(isSchemaValid({ type: 'int' })).toBe(true)
    })

    test('returns true for correct record', () => {
      expect(isSchemaValid({ type: 'record', fields: [], name: 'test' })).toBe(true)
    })
  })

  describe('isPrimitiveType', () => {
    test('returns false for no input', () => {
      expect(isPrimitiveType()).toBe(false)
    })

    test('returns false for unions array input', () => {
      expect(isPrimitiveType([])).toBe(false)
    })

    test('returns false for empty string input', () => {
      expect(isPrimitiveType('')).toBe(false)
    })

    test(`returns false for a complex avro type 'record'`, () => {
      expect(
        isPrimitiveType({ type: 'record', fields: [], name: 'test' })
      ).toBe(false)
    })

    test(`returns false for referenced schema`, () => {
      expect(isPrimitiveType('MyLongList')).toBe(false)
    })

    test(`returns true for a string primitive avro type 'int'`, () => {
      expect(isPrimitiveType('int')).toBe(true)
    })

    test(`returns true for a schema primitive avro type 'int'`, () => {
      expect(isPrimitiveType({ type: 'int' })).toBe(true)
    })
  })

  describe('getPrimitiveAvroType', () => {
    test(`returns undefined for no input`, () => {
      expect(getPrimitiveAvroType()).toBeUndefined()
    })

    test(`returns undefined for a non primitive schema`, () => {
      expect(
        getPrimitiveAvroType({ type: 'record', fields: [], name: 'test' })
      ).toBeUndefined()
    })

    test(`returns undefined for a referenced schema`, () => {
      expect(getPrimitiveAvroType('MyLongList')).toBeUndefined()
    })

    test(`returns the type name for a primitive string schema 'int'`, () => {
      expect(getPrimitiveAvroType('int')).toBe('int')
    })

    test(`returns the type name for a primitive schema 'int'`, () => {
      expect(getPrimitiveAvroType({ type: 'int' })).toBe('int')
    })
  })

  describe('isUnionSchema', () => {
    test(`returns false for no input`, () => {
      expect(isUnionSchema()).toBe(false)
    })

    test(`returns false for a non-union schema input`, () => {
      expect(isUnionSchema({ type: 'record', fields: [], name: 'test' })).toBe(
        false
      )
    })

    test(`returns false for a string-referenced schema input`, () => {
      expect(isUnionSchema('LongList')).toBe(false)
    })

    test(`returns false for an empty list`, () => {
      expect(isUnionSchema([])).toBe(false)
    })

    test(`returns true for a list of schemas`, () => {
      expect(isUnionSchema(['null', 'string'])).toBe(true)
    })
  })

  describe('isArraySchema', () => {
    test(`returns false for no input`, () => {
      expect(isArraySchema()).toBe(false)
    })

    test(`returns false for a non-array schema input`, () => {
      expect(isArraySchema({ type: 'record', fields: [], name: 'test' })).toBe(
        false
      )
    })

    test(`returns false for a string-referenced schema input`, () => {
      expect(isArraySchema('LongList')).toBe(false)
    })

    test(`returns true for an array schema input`, () => {
      expect(isArraySchema({ type: 'array', items: 'null' })).toBe(true)
    })
  })

  describe('isMapSchema', () => {
    test(`returns false for no input`, () => {
      expect(isMapSchema()).toBe(false)
    })

    test(`returns false for a non-map schema input`, () => {
      expect(isMapSchema({ type: 'record', fields: [], name: 'test' })).toBe(
        false
      )
    })

    test(`returns false for a string-referenced schema input`, () => {
      expect(isMapSchema('LongList')).toBe(false)
    })

    test(`returns true for a map schema input`, () => {
      expect(isMapSchema({ type: 'map', values: 'null' })).toBe(true)
    })
  })

  describe('isRecordSchema', () => {
    test(`returns false for no input`, () => {
      expect(isRecordSchema()).toBe(false)
    })

    test(`returns false for a non-record schema input`, () => {
      expect(isRecordSchema({ type: 'map', values: 'null' })).toBe(false)
    })

    test(`returns false for a string-referenced schema input`, () => {
      expect(isRecordSchema('LongList')).toBe(false)
    })

    test(`returns true for a record schema input`, () => {
      expect(isRecordSchema({ type: 'record', fields: [], name: 'test' })).toBe(
        true
      )
    })
  })

  describe('isFixedSchema', () => {
    test(`returns false for no input`, () => {
      expect(isFixedSchema()).toBe(false)
    })

    test(`returns false for a non-fixed schema input`, () => {
      expect(isFixedSchema({ type: 'record', fields: [], name: 'test' })).toBe(
        false
      )
    })

    test(`returns false for a string-referenced schema input`, () => {
      expect(isFixedSchema('LongList')).toBe(false)
    })

    test(`returns true for a fixed schema input`, () => {
      expect(isFixedSchema({ type: 'fixed', size: 8, name: 'test' })).toBe(true)
    })
  })

  describe('isEnumSchema', () => {
    test(`returns false for no input`, () => {
      expect(isEnumSchema()).toBe(false)
    })

    test(`returns false for a non-enum schema input`, () => {
      expect(isEnumSchema({ type: 'record', fields: [], name: 'test' })).toBe(
        false
      )
    })

    test(`returns false for a string-referenced schema input`, () => {
      expect(isEnumSchema('LongList')).toBe(false)
    })

    test(`returns false for an enum schema input with non-string symbols`, () => {
      expect(
        isEnumSchema({
          type: 'enum',
          symbols: ['a', 'b', 3] as any,
          name: 'test',
        })
      ).toBe(false)
    })

    test(`returns true for an enum schema input`, () => {
      expect(
        isEnumSchema({ type: 'enum', symbols: ['a', 'b'], name: 'test' })
      ).toBe(true)
    })
  })

  describe('isComplexSchema', () => {
    test(`returns false for no input`, () => {
      expect(isComplexSchema()).toBe(false)
    })

    test(`returns false for primitive string schema`, () => {
      expect(isComplexSchema('int')).toBe(false)
    })

    test(`returns false for primitive object schema`, () => {
      expect(isComplexSchema({ type: 'int' })).toBe(false)
    })

    test(`returns true for complex schema like record`, () => {
      expect(
        isComplexSchema({ type: 'record', fields: [], name: 'test' })
      ).toBe(true)
    })

    test(`returns true for referenced schema`, () => {
      expect(isComplexSchema('MyLongList')).toBe(true)
    })
  })

  describe('isComplexNamedSchema', () => {
    test(`returns false for no input`, () => {
      expect(isComplexNamedSchema()).toBe(false)
    })

    test(`returns false for primitive string schema`, () => {
      expect(isComplexNamedSchema('int')).toBe(false)
    })

    test(`returns false for primitive object schema`, () => {
      expect(isComplexNamedSchema({ type: 'int' })).toBe(false)
    })

    test(`returns false for referenced schema`, () => {
      expect(isComplexNamedSchema('MyLongList')).toBe(false)
    })

    test(`returns true for complex schema like record`, () => {
      expect(
        isComplexNamedSchema({ type: 'record', fields: [], name: 'test' })
      ).toBe(true)
    })
  })

  describe('getSchemStringName', () => {
    test(`returns '<none>' for no input`, () => {
      expect(getSchemaStringName()).toBe('<none>')
    })

    test(`returns name for referenced schema`, () => {
      expect(getSchemaStringName('MyLongList')).toBe('MyLongList')
    })

    test(`returns type for primitive string schema`, () => {
      expect(getSchemaStringName('int')).toBe('int')
    })

    test(`returns type for primitive object schema`, () => {
      expect(getSchemaStringName({ type: 'int' })).toBe('int')
    })

    test(`returns type for complex schema without name like array`, () => {
      expect(getSchemaStringName({ type: 'array', items: 'null' })).toBe(
        'array'
      )
    })

    test(`returns name for complex schema with name like record`, () => {
      expect(
        getSchemaStringName({ type: 'record', fields: [], name: 'Test' })
      ).toBe('Test')
    })

    test(`returns name without namespace for complex schema with name like record`, () => {
      expect(
        getSchemaStringName({
          type: 'record',
          fields: [],
          name: 'Test',
          namespace: 'some.namespace',
        })
      ).toBe('Test')
    })

    test(`returns concatenated names of union types`, () => {
      expect(
        getSchemaStringName([
          {
            type: 'record',
            fields: [],
            name: 'Test',
            namespace: 'some.namespace',
          },
          'int',
          { type: 'array', items: 'null' },
        ])
      ).toBe('Test | int | array')
    })
  })
})
