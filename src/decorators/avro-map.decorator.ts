import { BaseDecoratorArgs, BaseTypeMetadata, ClassType, OfType } from '../types'
import {
  enrichDecoratorMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroMap<T>(
  isMapProps: {
    ofType: () => OfType<T>
  } & BaseDecoratorArgs<Record<string, T>>
): (target: any, propertyKey: string) => void {
  return function (target: any, propertyKey: string) {
    const typeMetadata: {
      values: ClassType
    } & BaseTypeMetadata<Record<string, T>> = enrichDecoratorMetadata(
      { typeName: 'map', values: isMapProps.ofType() },
      isMapProps
    )

    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
