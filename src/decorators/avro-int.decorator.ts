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
 * Marks a record field as avro int schema.
 * 
 * @param intProps A collection of optional properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * @Record()
 * export class Fruit {
 *   @AvroInt()
 *   seeds: number;
 * }
 * ```
 */
export function AvroInt(
  intProps?: BaseFieldDecoratorArgs<number>
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(propertyKey, intProps)
    const typeMetadata: PrimitiveDefinedTypeMetadata = {
      typeName: 'primitive-defined-type',
      primitiveDefinedType: 'int',
      nullable: intProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
