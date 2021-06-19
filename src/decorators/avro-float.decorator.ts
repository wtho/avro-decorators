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
 * Marks a record field as avro float schema.
 * 
 * @param floatProps A collection of optional properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * @Record()
 * export class Fruit {
 *   @AvroFloat()
 *   avgWeight: number;
 * }
 * ```
 */
export function AvroFloat(
  floatProps?: BaseFieldDecoratorArgs<number>
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(
      propertyKey,
      floatProps
    )
    const typeMetadata: PrimitiveDefinedTypeMetadata = {
      typeName: 'primitive-defined-type',
      primitiveDefinedType: 'float',
      nullable: floatProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
