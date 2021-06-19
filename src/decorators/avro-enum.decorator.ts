import { BaseFieldDecoratorArgs, EnumMetadata, Prototype } from '../types'
import {
  determineFieldMetadataFromProps,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

/**
 * Marks a record field as avro enum schema.
 * 
 * @param enumProps A collection of properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * const fruitTypes = ['berry', 'tropical'] as const
 * type FruitType = typeof fruitTypes[number]
 * 
 * @Record()
 * export class Fruit {
 *   @AvroEnum({ name: 'FruitType', symbols: fruitTypes })
 *   fruitType: FruitType
 * }
 * ```
 */
export function AvroEnum<D extends E, E extends string>(
  enumProps: {
    /** The symbol listing as string array (required). All symbols must be unique and must match the regular expression `[A-Za-z_][A-Za-z0-9_]*` */
    symbols: readonly E[]
    /** The name of the enum (required) */
    name: string
    /** Dot-separated sequence of names to qualify the enum name. */
    namespace?: string
    /** An array of strings, providing alternate names for this enum. */
    typeAliases?: string[]
    /** A string providing documentation to the user of this schema. */
    typeDoc?: string
    /** A default value for this enumeration, used during resolution when the reader encounters a symbol from the writer that isn't defined in the reader's schema. The value provided here must be a string that's a member of the symbols array. */
    typeDefault?: D
  } & BaseFieldDecoratorArgs<D>
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(
      propertyKey,
      enumProps
    )
    const typeMetadata: EnumMetadata = {
      typeName: 'enum-type',
      name: enumProps.name,
      symbols: enumProps.symbols,
      nullable: enumProps?.nullable ?? false,
    }

    // enum-only type data
    if (enumProps.namespace) {
      typeMetadata.namespace = enumProps.namespace
    }
    if (enumProps.typeAliases) {
      typeMetadata.aliases = enumProps.typeAliases
    }
    if (enumProps.typeDoc) {
      typeMetadata.doc = enumProps.typeDoc
    }
    if (enumProps.typeDefault) {
      typeMetadata.default = enumProps.typeDefault
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
