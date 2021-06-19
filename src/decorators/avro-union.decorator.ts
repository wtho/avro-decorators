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

/**
 * Marks a record field as avro union schema.
 * 
 * @param fieldProps A collection of properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * @param unionTypes An array of schemas representing a union of embedded types.
 * 
 * Example:
 * ```typescript
 * @Record()
 * export class Model {
 *   @AvroUnion(
 *     {
 *       fieldDoc:
 *         'Can be an int, a string, null, an address, a map of strings or an array of longs',
 *       fieldDefault: 0,
 *     },
 *     [
 *       'int',
 *       'string',
 *       'null',
 *       () => Address,
 *       { map: { values: 'string' } },
 *       { array: { items: 'long', default: [] } },
 *     ]
 *   )
 *   field: number | string | null | Address | Record<string, string> | number[]
 * }
 * ```
 */
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
