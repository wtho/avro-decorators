import {
  BaseFieldDecoratorArgs,
  InlineInUnionTypeDefinition,
  Prototype,
  UnionMetadata,
} from '../types'
import {
  determineFieldMetadataFromProps,
  resolveInlineTypeDefinition,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroUnion<T>(
  fieldProps: BaseFieldDecoratorArgs<Record<string, T>>,
  unionTypes: InlineInUnionTypeDefinition[]
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(
      propertyKey,
      fieldProps
    )
    const typeMetadata: UnionMetadata = {
      typeName: 'union-type',
      types: unionTypes.map((type) => resolveInlineTypeDefinition(type)),
      nullable: fieldProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
