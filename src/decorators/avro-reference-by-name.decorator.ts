import {
  BaseFieldDecoratorArgs,
  Prototype,
  ReferencedTypeMetadata,
} from '../types'
import {
  determineFieldMetadataFromProps,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

/**
 * Marks a record field as avro schema referenced by name.
 * 
 * @param referenceProps A collection of properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * @Record()
 * export class Fruit {
 *   @AvroReferenceByName({ reference: 'Fruit' })
 *   parentFruit: Fruit
 * }
 * ```
 */
export function AvroReferenceByName(
  referenceProps?: {
    /** The name of a defined, non-primitive type. */
    reference: string
  } & BaseFieldDecoratorArgs<string>
): (target: Prototype, propertyKey: string) => void {
  // TODO check this is no primitive type
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(
      propertyKey,
      referenceProps
    )
    const typeMetadata: ReferencedTypeMetadata = {
      typeName: 'referenced-defined-type',
      reference: referenceProps.reference,
      nullable: referenceProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
