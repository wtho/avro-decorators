import 'reflect-metadata'
import { enrichDecoratorMetadata, storeAvroFieldTypeReflectionMetadata } from "./decorator-utils"

describe('decorator-utils', () => {
  describe('storeAvroFieldTypeReflectionMetadata', () => {
    test('stores avro-type metadata on target', () => {
      const setMetadata = {
        typeName: 'some-avro-type'
      } as any
      const target = {}

      storeAvroFieldTypeReflectionMetadata(setMetadata, target, 'fantasyKey')

      const retrievedMetadata = Reflect.getMetadata('avro-type', target, 'fantasyKey')
      expect(retrievedMetadata).toEqual({typeName: 'some-avro-type'})
    })

    test('stores avro-field-names metadata on target', () => {
      const setMetadata = {
        typeName: 'some-avro-type'
      } as any
      const target = {}

      storeAvroFieldTypeReflectionMetadata(setMetadata, target, 'fantasyKey')

      const retrievedMetadata = Reflect.getMetadata('avro-field-names', target)
      expect(retrievedMetadata).toEqual(['fantasyKey'])
    })

    test('store additional avro-field-names metadata on target', () => {
      const setMetadata = {
        typeName: 'some-avro-type'
      } as any
      const target = {}
      Reflect.defineMetadata('avro-field-names', ['key1', 'key2'], target)

      storeAvroFieldTypeReflectionMetadata(setMetadata, target, 'fantasyKey')

      const retrievedMetadata = Reflect.getMetadata('avro-field-names', target)
      expect(retrievedMetadata).toEqual(['key1', 'key2', 'fantasyKey'])
    })
  })

  describe('enrichDecoratorMetadata', () => {
    test('enriches no metadata to data', () => {

      const inputTypeMetadata = {
        typeName: 'test-type'
      } as any
      const enricherData = {

      }

      const enriched = enrichDecoratorMetadata(inputTypeMetadata, enricherData)

      expect(enriched).toEqual({
        nullable: false,
        typeName: 'test-type'
      })
    })

    test('enriches undefined metadata to data', () => {

      const inputTypeMetadata = {
        typeName: 'test-type'
      } as any

      const enriched = enrichDecoratorMetadata(inputTypeMetadata)

      expect(enriched).toEqual({
        nullable: false,
        typeName: 'test-type'
      })
    })

    test('enriches all possible metadata to data', () => {

      const inputTypeMetadata = {
        typeName: 'test-type'
      } as any
      const enrichingMetadata = {
        nullable: true,
        namespace: 'some.namespace',
        order: 'test-order',
        aliases: ['test-alias-1', 'test-alias-2'],
        description: 'test-description',
        unknownMetadata: 'should-not-be-enriched'
      } as any

      const enriched = enrichDecoratorMetadata(inputTypeMetadata, enrichingMetadata)

      expect(enriched).toEqual({
        nullable: true,
        typeName: 'test-type',
        namespace: 'some.namespace',
        order: 'test-order',
        aliases: ['test-alias-1', 'test-alias-2'],
        doc: 'test-description',
      })
    })

    test('overrides avro name with avroOverrideName', () => {
      const inputTypeMetadata = {
        typeName: 'test-type',
        name: 'test-name'
      } as any
      const enrichingMetadata = {
        avroOverrideName: 'overridden-test-name'
      } as any

      const enriched = enrichDecoratorMetadata(inputTypeMetadata, enrichingMetadata)

      expect(enriched).toEqual({
        typeName: 'test-type',
        nullable: false,
        name: 'overridden-test-name'
      })
    })
  })
})
