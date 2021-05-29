import {
  BaseDecoratorArgs,
  BaseTypeMetadata,
  ClassType,
  OfType,
} from '../types'
import {
  enrichDecoratorMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroArray<T>(
  isArrayProps: {
    ofType: () => OfType<T>
  } & BaseDecoratorArgs<T[]>
): (target: any, propertyKey: string) => void {
  return function (target: any, propertyKey: string) {
    const typeMetadata: {
      items: ClassType
    } & BaseTypeMetadata<T[]> = enrichDecoratorMetadata(
      { typeName: 'array', items: isArrayProps.ofType() },
      isArrayProps
    )

    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
