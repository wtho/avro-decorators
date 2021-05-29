import { BaseDecoratorArgs, BaseTypeMetadata } from '../types'
import {
  enrichDecoratorMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroString(
  isStringProps?: BaseDecoratorArgs<string>
): (target: any, propertyKey: string) => void {
  return function (target: any, propertyKey: string) {
    const typeMetadata: BaseTypeMetadata<string> = enrichDecoratorMetadata(
      { typeName: 'string' },
      isStringProps
    )

    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
