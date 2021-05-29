import { BaseTypeMetadata, ClassType, Constructable } from '../types'
import { isPrimitiveType } from './avro-helper'
import {
  AvroOrder,
  BasicAvroType,
  ComplexSchemaType,
  Schema,
  RecordSchemaType,
} from '../avro.types'
import { AvroDecoratorsError } from './avro-decorators.error'

interface FieldSchema {
  name: string
  doc?: string
  type: Schema
  default?: unknown
  order?: AvroOrder
  aliases?: string[]
  symbols?: string[]
  items?: BasicAvroType
  values?: BasicAvroType
}

function isConstructable(fn: unknown): fn is Constructable<unknown> {
  try {
    Reflect.construct(String, [], fn as Function)
  } catch (e) {
    return false
  }
  return true
}

function nullified(type: Schema, nullable: boolean): Schema {
  if (!nullable) {
    return type
  }
  return ['null', type]
}

export function avroSchemaFromClass(constructable: Constructable<unknown>): Schema {
  if (!isConstructable(constructable)) {
    throw new AvroDecoratorsError(`Could not create schema from class: ${constructable}`)
  }
  const annotatee = new constructable()

  const { typeName, ...aType } = (Reflect.getMetadata(
    'avro-type',
    annotatee.constructor
  ) ?? {}) as BaseTypeMetadata<unknown>

  if (!typeName) {
    throw new AvroDecoratorsError('Could not create schema due to missing metadata on class: ${constructable}')
  }

  const fieldNames: string[] = Reflect.getMetadata(
    'avro-field-names',
    annotatee
  ) ?? []

  const fields: FieldSchema[] = fieldNames?.map((key) => {
    const {
      nullable,
      typeName,
      doc,
      default: defaultValue,
      order,
      aliases,
      ...avroType
    } = Reflect.getMetadata('avro-type', annotatee, key) as BaseTypeMetadata<unknown>
    const typeDef = isPrimitiveType(typeName)
      ? typeName
      : typeName === 'reference'
      ? typeName
      : ({ type: typeName } as ComplexSchemaType)
    // const tsType: ClassType = Reflect.getMetadata('design:type', annotatee, key)
    if (typeName === 'record') {
      const { recordType, ...recordFields } = avroType as BaseTypeMetadata<unknown> & {
        recordType: ClassType
      }
      if (recordType && isConstructable(recordType)) {
        const resolvedRecordType = avroSchemaFromClass(recordType)
        const fieldSchema: FieldSchema = {
          name: key,
          type: nullified(resolvedRecordType, nullable),
          ...recordFields,
        }
        if (doc) {
          fieldSchema.doc = doc
        }
        if (aliases) {
          fieldSchema.aliases = aliases
        }
        if (order) {
          fieldSchema.order = order
        }
        if (defaultValue !== undefined) {
          fieldSchema.default = defaultValue
        }
        return fieldSchema
      } else {
        return {
          name: key,
          type: undefined,
        }
      }
    }
    if (isPrimitiveType(typeDef)) {
      const fieldSchema: FieldSchema = {
        name: key,
        ...avroType,
        type: nullified(typeDef, nullable),
      }
      if (doc) {
        fieldSchema.doc = doc
      }
      if (aliases) {
        fieldSchema.aliases = aliases
      }
      if (order) {
        fieldSchema.order = order
      }
      if (defaultValue !== undefined) {
        fieldSchema.default = defaultValue
      }
      return fieldSchema
    }
    if (typeDef === 'reference') {
      const { referencedTypeName, ...baseAvroProps } = avroType as BaseTypeMetadata<unknown> & { referencedTypeName: string }
      const fieldSchema: FieldSchema = {
        name: key,
        ...baseAvroProps,
        type: nullified(referencedTypeName, nullable),
      }
      if (doc) {
        fieldSchema.doc = doc
      }
      if (aliases) {
        fieldSchema.aliases = aliases
      }
      if (order) {
        fieldSchema.order = order
      }
      if (defaultValue !== undefined) {
        fieldSchema.default = defaultValue
      }
      return fieldSchema
    }
    const fieldSchema: FieldSchema = {
      name: key,
      type: nullified(
        {
          ...typeDef,
          ...avroType,
        },
        nullable,
      ),
    }
    if (doc) {
      fieldSchema.doc = doc
    }
    if (aliases) {
      fieldSchema.aliases = aliases
    }
    if (order) {
      fieldSchema.order = order
    }
    if (defaultValue !== undefined) {
      fieldSchema.default = defaultValue
    }
    return fieldSchema
  })

  if (isPrimitiveType(typeName)) {
    return {
      type: typeName,
      ...aType,
      // fields,
    }
  }

  if (typeName === 'record') {
    return {
      type: typeName,
      ...aType,
      fields,
    } as RecordSchemaType
  }

  throw new AvroDecoratorsError(`A schema built root type must be record, not ${typeName}`)
}

