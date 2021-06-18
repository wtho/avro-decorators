import { BaseFieldDecoratorArgs, FixedMetadata, Prototype } from '../types'
import {
  determineFieldMetadataFromProps,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroFixed<T>(
  fixedProps: {
    name: string
    size: number
    namespace?: string
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
