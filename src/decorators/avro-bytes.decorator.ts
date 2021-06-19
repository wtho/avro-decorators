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
 * Marks a record field as avro bytes schema.
 * 
 * @param bytesProps A collection of optional properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * @Record()
 * export class Model {
 *   @AvroBytes()
 *   data;
 * }
 * ```
 */
export function AvroBytes(
  bytesProps?: BaseFieldDecoratorArgs<unknown> // TODO what's a byte's default?
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(
      propertyKey,
      bytesProps
    )
    const typeMetadata: PrimitiveDefinedTypeMetadata = {
      typeName: 'primitive-defined-type',
      primitiveDefinedType: 'bytes',
      nullable: bytesProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
