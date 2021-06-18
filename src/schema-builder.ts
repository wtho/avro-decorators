import {
  Constructable,
  FieldMetadata,
  RecordMetadata,
  TypeMetadata,
} from './types'
import {
  AvroOrder,
  BasicAvroType,
  Schema,
  RecordSchemaType,
  EnumSchemaType,
  ArraySchemaType,
  MapSchemaType,
  FixedSchemaType,
  UnionSchemaType,
} from './avro.types'
import { AvroDecoratorsError } from './internals/avro-decorators.error'

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

function nullified(type: Schema, nullable: boolean): Schema {
  if (!nullable) {
    return type
  }
  if (Array.isArray(type)) {
    if (type.includes('null')) {
      return type
    }
    return ['null', ...type]
  }
  return ['null', type]
}

function getTypeSchema(typeMetadata: TypeMetadata): Schema {
  if (typeMetadata.typeName === 'primitive-defined-type') {
    return nullified(typeMetadata.primitiveDefinedType, typeMetadata.nullable)
  }
  // if (typeMetadata.typeName === 'primitive-type') {
  //   return nullified(typeMetadata.primitiveType, typeMetadata.nullable)
  // }
  if (typeMetadata.typeName === 'referenced-defined-type') {
    return nullified(typeMetadata.reference, typeMetadata.nullable)
  }
  if (typeMetadata.typeName === 'enum-type') {
    const enumSchema: EnumSchemaType = {
      type: 'enum',
      name: typeMetadata.name,
      symbols: typeMetadata.symbols,
    }
    if (typeMetadata.namespace) {
      enumSchema.namespace = typeMetadata.namespace
    }
    if (typeMetadata.aliases) {
      enumSchema.aliases = typeMetadata.aliases
    }
    if (typeMetadata.doc) {
      enumSchema.doc = typeMetadata.doc
    }
    if (typeMetadata.default !== undefined) {
      enumSchema.default = typeMetadata.default
    }
    return nullified(enumSchema, typeMetadata.nullable)
  }
  if (typeMetadata.typeName === 'array-type') {
    const arraySchema: ArraySchemaType = {
      type: 'array',
      items: getTypeSchema(typeMetadata.items),
    }
    if (typeMetadata.default !== undefined) {
      arraySchema.default = typeMetadata.default
    }
    return nullified(arraySchema, typeMetadata.nullable)
  }
  if (typeMetadata.typeName === 'map-type') {
    const mapSchema: MapSchemaType = {
      type: 'map',
      values: getTypeSchema(typeMetadata.values),
    }
    if (typeMetadata.default !== undefined) {
      mapSchema.default = typeMetadata.default
    }
    return nullified(mapSchema, typeMetadata.nullable)
  }
  if (typeMetadata.typeName === 'fixed-type') {
    const fixedSchema: FixedSchemaType = {
      type: 'fixed',
      name: typeMetadata.name,
      size: typeMetadata.size,
    }
    if (typeMetadata.namespace) {
      fixedSchema.namespace = typeMetadata.namespace
    }
    if (typeMetadata.aliases) {
      fixedSchema.aliases = typeMetadata.aliases
    }
    return nullified(fixedSchema, typeMetadata.nullable)
  }
  if (typeMetadata.typeName === 'union-type') {
    // TODO verify according to documentation
    // https://avro.apache.org/docs/current/spec.html#Unions
    // Unions may not contain more than one schema with the same type, except for the named types record, fixed and enum. For example, unions containing two array types or two map types are not permitted, but two types with different names are permitted. (Names permit efficient resolution when reading and writing unions.)
    // also if default is defined, it must match the first type
    const unionSchema: UnionSchemaType = typeMetadata.types.map(
      (innerTypeMetadata) => getTypeSchema(innerTypeMetadata)
    )
    return nullified(unionSchema, typeMetadata.nullable)
  }
  if (typeMetadata.typeName === 'record-type') {
    const recordSchema = avroSchemaFromClass(typeMetadata.class)
    return nullified(recordSchema, typeMetadata.nullable)
  }

  throw new AvroDecoratorsError(`The type name '${(typeMetadata as any).typeName ?? 'none'}' is unknown to avro decorators schema builder.`)
}

function getFieldSchemaForField(
  fieldMetadata: FieldMetadata<unknown>,
  fieldTypeMetadata: TypeMetadata
): FieldSchema {
  const {
    name,
    nullable,
    doc,
    default: defaultValue,
    order,
    aliases,
  } = fieldMetadata

  let resolvedType: Schema
  try {
    resolvedType = getTypeSchema(fieldTypeMetadata)
  } catch (err) {
    throw new AvroDecoratorsError(`Could not resolve schema for field '${name}': ${err.message}`)
  }

  const fieldSchema: FieldSchema = {
    name: name,
    type: nullified(resolvedType, nullable),
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

export function avroSchemaFromClass(
  constructable: Constructable<unknown>
): Schema {
  let recordMetadata: RecordMetadata
  try {
    recordMetadata = Reflect.getMetadata(
      'avro-type',
      constructable
    )
  } catch (err) {
    if (err.name === 'TypeError') {
      throw new AvroDecoratorsError('Model does not seem to be a class - cannot parse metadata')
    }
    throw err
  }

  if (!recordMetadata?.name) {
    throw new AvroDecoratorsError(
      `Could not create schema due to missing metadata on class: ${constructable}`
    )
  }

  const { name, aliases, doc, namespace } = recordMetadata


  const fieldNames: string[] =
    Reflect.getMetadata('avro-field-names', constructable) ?? []

  const fields: FieldSchema[] = fieldNames?.map((key) => {
    const fieldMetadata = Reflect.getMetadata(
      'avro-field',
      constructable,
      key
    ) as FieldMetadata<unknown>
    const fieldTypeMetadata = Reflect.getMetadata(
      'avro-field-type',
      constructable,
      key
    ) as TypeMetadata
    return getFieldSchemaForField(fieldMetadata, fieldTypeMetadata)
  })

  const recordSchema: RecordSchemaType = {
    type: 'record',
    name,
    fields
  }

  if (namespace) {
    recordSchema.namespace = namespace
  }
  if (doc) {
    recordSchema.doc = doc
  }
  if (aliases) {
    recordSchema.aliases = aliases
  }

  return recordSchema
}
