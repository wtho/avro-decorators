import { BaseDecoratorArgs, BaseTypeMetadata } from '../types'
import {
  enrichDecoratorMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroEnum<D extends E, E extends string>(
  isEnumProps: {
    symbols: readonly E[],
    name: string,
    namespace?: string,
  } & BaseDecoratorArgs<D>
): (target: any, propertyKey: string) => void {
  return function (target: any, propertyKey: string) {
    const typeMetadata: {
      symbols: readonly string[]
      name: string
    } & BaseTypeMetadata<E> = enrichDecoratorMetadata(
      { typeName: 'enum', symbols: isEnumProps.symbols, name: isEnumProps.name },
      isEnumProps
    )

    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
