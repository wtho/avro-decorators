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

export function AvroReferenceByName(
  referenceProps?: {
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
