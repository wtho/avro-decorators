import {
  ArrayMetadata,
  BaseFieldDecoratorArgs,
  InlineTypeDefinition,
  Prototype,
} from '../types'
import {
  determineFieldMetadataFromProps,
  resolveInlineTypeDefinition,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

/**
 * Marks a record field as avro array schema.
 * 
 * @param arrayProps A collection of properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * @Record()
 * export class Fruit {
 *   @AvroArray({ ofType: 'double', fieldDefault: [] })
 *   weightSamples: number[]
 * }
 * ```
 */
export function AvroArray<T>(
  arrayProps: {
    /**
     * The schema of the array's items, referenced as string if primitive or a reference,
     * as object if map, array, enum or fixed or as thunk if it is a record:
     * 
     * ```
     * ofType: 'string'
     * ofType: { enum: { name: 'EnumName', symbols: ['symbol1', 'symbol2'] } }
     * ofType: { map: { values: 'string' } }
     * ofType: () => Address
     * ofType: 'MyAddressNamedReference'
     * ```
     */
    ofType: InlineTypeDefinition
    /** The default value of the array itself, not the field, usually the empty array `[]`. */
    arrayDefault?: T[]
  } & BaseFieldDecoratorArgs<T[]>
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(
      propertyKey,
      arrayProps
    )
    const typeMetadata: ArrayMetadata = {
      typeName: 'array-type',
      items: resolveInlineTypeDefinition(arrayProps.ofType),
      default: arrayProps.arrayDefault,
      nullable: arrayProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
