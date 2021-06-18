import {
  ArrayMetadata,
  BaseFieldDecoratorArgs,
  InlineTypeDefinition,
  Prototype,
} from '../types'
import {
  determineFieldMetadataFromProps,
  resolveInlineTypeDefinition,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroArray<T>(
  arrayProps: {
    ofType: InlineTypeDefinition
    arrayDefault?: T[]
  } & BaseFieldDecoratorArgs<T[]>
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(
      propertyKey,
      arrayProps
    )
    const typeMetadata: ArrayMetadata = {
      typeName: 'array-type',
      items: resolveInlineTypeDefinition(arrayProps.ofType),
      default: arrayProps.arrayDefault,
      nullable: arrayProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
