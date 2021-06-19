import { BaseFieldDecoratorArgs, FixedMetadata, Prototype } from '../types'
import {
  determineFieldMetadataFromProps,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

/**
 * Marks a record field as avro fixed schema.
 * 
 * @param fixedProps A collection of properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * @Record()
 * export class Fruit {
 *   @AvroFixed({ name: 'Md5Hash', size: 16 })
 *   md5Hash: string
 * }
 * ```
 */
export function AvroFixed<T>(
  fixedProps: {
    /** A string naming this fixed (required). */
    name: string
    /** An integer specifying the number of bytes per value (required). */
    size: number
    /** Dot-separated sequence of names to qualify the fixed name. */
    namespace?: string
    /** An array of strings, providing alternate names for this fixed. */
    fixedAliases?: string[]
  } & BaseFieldDecoratorArgs<T>
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(
      propertyKey,
      fixedProps
    )
    const typeMetadata: FixedMetadata = {
      typeName: 'fixed-type',
      name: fixedProps.name,
      size: fixedProps.size,
      nullable: fixedProps?.nullable ?? false,
    }
    if (fixedProps.namespace) {
      typeMetadata.namespace = fixedProps.namespace
    }
    if (fixedProps.fixedAliases) {
      typeMetadata.aliases = fixedProps.fixedAliases
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
