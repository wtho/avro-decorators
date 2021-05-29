import { Type, Schema as AvscSchema } from 'avsc'
import {
  ArraySchemaType,
  ComplexSchemaType,
  EnumSchemaType,
  FixedSchemaType,
  MapSchemaType,
  PrimitiveAvroType,
  PrimitiveSchemaType,
  RecordSchemaType,
  Schema,
  UnionSchemaType,
} from '../avro.types'

function isString(schema: Schema): schema is string {
  return typeof schema === 'string'
}

export function isSchemaValid(jsonSchema: Schema): boolean {
  try {
    Type.forSchema(jsonSchema as AvscSchema)
    return true
  } catch (err) {
    // TODO: do not print out here, but return message
    // console.error('  [type-validation]: Schema is not valid -', err.message)
    return false
  }
}

export function isPrimitiveType(
  schema?: Schema
): schema is PrimitiveAvroType | PrimitiveSchemaType {
  const primitiveTypeList: PrimitiveAvroType[] = [
    'bytes',
    'boolean',
    'double',
    'float',
    'int',
    'long',
    'null',
    'string',
  ]
  if (!schema) {
    return false
  }
  if (typeof schema !== 'string' && !Array.isArray(schema)) {
    return primitiveTypeList.includes(schema.type as PrimitiveAvroType)
  }
  return primitiveTypeList.includes(schema as PrimitiveAvroType)
}

export function getPrimitiveAvroType(
  schema?: Schema
): PrimitiveAvroType | undefined {
  if (!isPrimitiveType(schema)) {
    return undefined
  }
  return typeof schema === 'string' ? schema : schema.type
}

export function isUnionSchema(schema?: Schema): schema is UnionSchemaType {
  if (!schema) {
    return false
  }
  return (
    typeof schema === 'object' && Array.isArray(schema) && schema.length > 0
  )
}

export function isArraySchema(schema?: Schema): schema is ArraySchemaType {
  if (
    !schema ||
    isString(schema) ||
    isPrimitiveType(schema) ||
    isUnionSchema(schema)
  ) {
    return false
  }
  return schema.type === 'array'
}

export function isMapSchema(schema?: Schema): schema is MapSchemaType {
  if (
    !schema ||
    isString(schema) ||
    isPrimitiveType(schema) ||
    isUnionSchema(schema)
  ) {
    return false
  }
  return schema.type === 'map'
}

export function isRecordSchema(schema?: Schema): schema is RecordSchemaType {
  if (
    !schema ||
    isString(schema) ||
    isPrimitiveType(schema) ||
    isUnionSchema(schema)
  ) {
    return false
  }
  return schema.type === 'record'
}

export function getSchemaStringName(schema?: Schema): string {
  if (!schema) {
    return '<none>'
  }
  if (typeof schema === 'string') {
    return schema
  }
  if (isComplexNamedSchema(schema)) {
    return schema.name
  }
  if (isUnionSchema(schema)) {
    return schema.map((s) => getSchemaStringName(s)).join(' | ')
  }
  return schema.type
}

export function isComplexSchema(schema?: Schema): schema is ComplexSchemaType {
  if (!schema || isPrimitiveType(schema)) {
    return false
  }
  return true
}

export function isFixedSchema(schema?: Schema): schema is FixedSchemaType {
  if (
    !schema ||
    isString(schema) ||
    isPrimitiveType(schema) ||
    isUnionSchema(schema)
  ) {
    return false
  }
  return schema.type === 'fixed'
}

export function isEnumSchema(schema?: Schema): schema is EnumSchemaType {
  if (
    !schema ||
    isString(schema) ||
    isPrimitiveType(schema) ||
    isUnionSchema(schema)
  ) {
    return false
  }
  return (
    schema.type === 'enum' &&
    Array.isArray(schema.symbols) &&
    schema.symbols.length > 0 &&
    schema.symbols.every((symbol) => typeof symbol === 'string')
  )
}

export function isComplexNamedSchema(
  schema?: Schema
): schema is RecordSchemaType | EnumSchemaType | FixedSchemaType {
  if (!isComplexSchema(schema)) {
    return false
  }
  if (
    !isRecordSchema(schema) &&
    !isEnumSchema(schema) &&
    !isFixedSchema(schema)
  ) {
    return false
  }
  return true
}
