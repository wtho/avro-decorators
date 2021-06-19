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
 * Marks a record field as avro string schema.
 * 
 * @param stringProps A collection of optional properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * @Record()
 * export class Fruit {
 *   @AvroString()
 *   name: string;
 * }
 * ```
 */
export function AvroString(
  stringProps?: BaseFieldDecoratorArgs<string>
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(
      propertyKey,
      stringProps
    )
    const typeMetadata: PrimitiveDefinedTypeMetadata = {
      typeName: 'primitive-defined-type',
      primitiveDefinedType: 'string',
      nullable: stringProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
