import {
  BaseFieldDecoratorArgs,
  PrimitiveDefinedTypeMetadata,
  Prototype,
} from '../types'
import {
  determineFieldMetadataFromProps,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

/**
 * Marks a record field as avro long schema.
 * 
 * @param longProps A collection of optional properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * @Record()
 * export class Fruit {
 *   @AvroLong()
 *   seeds: number;
 * }
 * ```
 */
export function AvroLong(
  longProps?: BaseFieldDecoratorArgs<number>
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(
      propertyKey,
      longProps
    )
    const typeMetadata: PrimitiveDefinedTypeMetadata = {
      typeName: 'primitive-defined-type',
      primitiveDefinedType: 'long',
      nullable: longProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
