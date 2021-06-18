import {
  BaseFieldDecoratorArgs,
  FieldMetadata,
  InlineTypeDefinition,
  OfPrimitiveRefOrRecordType,
  Prototype,
  TypeMetadata,
} from '../types'
import { isPrimitiveDefinedType } from './avro-helper'

export function storeAvroFieldReflectionMetadata<
  M extends FieldMetadata<unknown>
>(typeMetadata: M, target: Prototype, propertyKey: string) {
  Reflect?.defineMetadata?.('avro-field', typeMetadata, target.constructor, propertyKey)

  const existingPropKeys: string[] =
    Reflect?.getMetadata?.('avro-field-names', target.constructor) ?? []
  if (!existingPropKeys.includes(propertyKey)) {
    Reflect?.defineMetadata?.(
      'avro-field-names',
      [...existingPropKeys, propertyKey],
      target.constructor
    )
  }
}

export function storeAvroFieldTypeReflectionMetadata(
  typeMetadata: TypeMetadata,
  target: Prototype,
  propertyKey: string
) {
  Reflect?.defineMetadata?.(
    'avro-field-type',
    typeMetadata,
    target.constructor,
    propertyKey
  )

  const existingPropKeys: string[] =
    Reflect?.getMetadata?.('avro-field-names', target.constructor) ?? []
  if (!existingPropKeys.includes(propertyKey)) {
    Reflect?.defineMetadata?.(
      'avro-field-names',
      [...existingPropKeys, propertyKey],
      target.constructor
    )
  }
}

export function determineFieldMetadataFromProps<T>(
  propertyKey: string,
  props?: BaseFieldDecoratorArgs<T>
): FieldMetadata<T> {
  let fieldMetadata: FieldMetadata<T> = {
    name: props?.fieldName ?? propertyKey,
  }
  if (props?.fieldDoc) {
    fieldMetadata = {
      ...fieldMetadata,
      doc: props.fieldDoc,
    }
  }
  if (props?.fieldDefault !== undefined) {
    fieldMetadata = {
      ...fieldMetadata,
      default: props.fieldDefault,
    }
  }
  if (props?.order) {
    fieldMetadata = {
      ...fieldMetadata,
      order: props.order,
    }
  }
  if (props?.fieldAliases) {
    fieldMetadata = {
      ...fieldMetadata,
      aliases: props.fieldAliases,
    }
  }

  return fieldMetadata
}

export function resolvePrimitiveRefOrRecordType(
  ofType: OfPrimitiveRefOrRecordType<unknown>
): TypeMetadata {
  if (typeof ofType === 'string' && isPrimitiveDefinedType(ofType)) {
    return {
      typeName: 'primitive-defined-type',
      primitiveDefinedType: ofType,
      nullable: false,
    }
  }
  if (typeof ofType === 'string') {
    return {
      typeName: 'referenced-defined-type',
      reference: ofType,
      nullable: false,
    }
  }
  return {
    typeName: 'record-type',
    class: ofType(),
    nullable: false,
  }
}

export function resolveInlineTypeDefinition(
  typeDef: InlineTypeDefinition
): TypeMetadata {
  if (typeof typeDef === 'string' && isPrimitiveDefinedType(typeDef)) {
    return {
      typeName: 'primitive-defined-type',
      primitiveDefinedType: typeDef,
      nullable: false,
    }
  }
  if (typeof typeDef === 'string') {
    return {
      typeName: 'referenced-defined-type',
      reference: typeDef,
      nullable: false,
    }
  }
  if (typeof typeDef === 'function') {
    return {
      typeName: 'record-type',
      class: typeDef(),
      nullable: false,
    }
  }
  if ('enum' in typeDef && typeDef.enum) {
    return {
      typeName: 'enum-type',
      name: typeDef.enum.name,
      symbols: typeDef.enum.symbols as readonly string[],
      nullable: false,
      aliases: typeDef.enum.typeAliases,
      default: typeDef.enum.typeDefault as string,
      namespace: typeDef.enum.namespace,
      doc: typeDef.enum.typeDoc,
    }
  }
  if ('array' in typeDef && typeDef.array) {
    return {
      typeName: 'array-type',
      items: resolveInlineTypeDefinition(typeDef.array.items),
      nullable: false,
      default: typeDef.array.default,
    }
  }
  if ('map' in typeDef && typeDef.map) {
    return {
      typeName: 'map-type',
      values: resolveInlineTypeDefinition(typeDef.map.values),
      nullable: false,
      default: typeDef.map.default,
    }
  }
  if ('fixed' in typeDef && typeDef.fixed) {
    return {
      typeName: 'fixed-type',
      name: typeDef.fixed.name,
      namespace: typeDef.fixed.namespace,
      nullable: false,
      size: typeDef.fixed.size,
      aliases: typeDef.fixed.aliases,
    }
  }
  if ('union' in typeDef && typeDef.union) {
    return {
      typeName: 'union-type',
      nullable: false,
      types: typeDef.union.map((innerTypeDef) =>
        resolveInlineTypeDefinition(innerTypeDef)
      ),
    }
  }

  throw new Error('unknown inline type')
}
