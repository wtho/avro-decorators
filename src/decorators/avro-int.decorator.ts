import { BaseDecoratorArgs, BaseTypeMetadata } from '../types'
import {
  enrichDecoratorMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroInt(
  isIntProps?: BaseDecoratorArgs<number>
): (target: any, propertyKey: string) => void {
  return function (target: any, propertyKey: string) {
    const typeMetadata: BaseTypeMetadata<number> = enrichDecoratorMetadata(
      { typeName: 'int' },
      isIntProps
    )

    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
