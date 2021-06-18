import { BaseFieldDecoratorArgs, EnumMetadata, Prototype } from '../types'
import {
  determineFieldMetadataFromProps,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroEnum<D extends E, E extends string>(
  enumProps: {
    symbols: readonly E[]
    name: string
    namespace?: string
    typeAliases?: string[]
    typeDoc?: string
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
