import {
  BaseFieldDecoratorArgs,
  MapMetadata,
  OfPrimitiveRefOrRecordType,
  Prototype,
} from '../types'
import {
  determineFieldMetadataFromProps,
  resolvePrimitiveRefOrRecordType,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

type OfType<T> = OfPrimitiveRefOrRecordType<T>

/**
 * Marks a record field as avro map schema.
 * 
 * @param mapProps A collection of properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * @Record()
 * export class Fruit {
 *   @AvroMap({ ofType: 'double', fieldDefault: {} })
 *   costPerYear: Record<string, number>
 * }
 * ```
 */
export function AvroMap<T>(
  mapProps: {
    /**
     * The schema of the array's items, referenced as string if primitive or a reference,
     * as object if map, array, enum or fixed or as thunk if it is a record:
     * 
     * ```
     * ofType: 'string'
     * ofType: { enum: { name: 'EnumName', symbols: ['symbol1', 'symbol2'] } }
     * ofType: { array: { values: 'string' } }
     * ofType: () => Address
     * ofType: 'MyAddressNamedReference'
     * ```
     */
    ofType: OfType<T>
    /** The default value of the map type itself, not the field, usually the empty dictionary `{}`. */
    mapDefault?: Record<string, T>
  } & BaseFieldDecoratorArgs<Record<string, T>>
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(propertyKey, mapProps)
    const typeMetadata: MapMetadata = {
      typeName: 'map-type',
      values: resolvePrimitiveRefOrRecordType(mapProps.ofType),
      default: mapProps.mapDefault,
      nullable: mapProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
