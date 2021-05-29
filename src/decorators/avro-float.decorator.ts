import { BaseDecoratorArgs, BaseTypeMetadata } from '../types'
import {
  enrichDecoratorMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroFloat(
  isFloatProps?: BaseDecoratorArgs<number>
): (target: any, propertyKey: string) => void {
  return function (target: any, propertyKey: string) {
    const typeMetadata: BaseTypeMetadata<number> = enrichDecoratorMetadata(
      { typeName: 'float' },
      isFloatProps
    )

    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
