import { OfType, BaseDecoratorArgs, ClassType, BaseTypeMetadata } from '../types'
import {
  enrichDecoratorMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroReferenceByName(
  isReferenceProps: {
    referencedTypeName: string
  } & BaseDecoratorArgs<unknown>
): (target: any, propertyKey: string) => void {
  return function (target: any, propertyKey: string) {
    const typeMetadata: {
      referencedTypeName: string
    } & BaseTypeMetadata<unknown> = enrichDecoratorMetadata(
      { typeName: 'reference', referencedTypeName: isReferenceProps.referencedTypeName },
      isReferenceProps
    )

    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
