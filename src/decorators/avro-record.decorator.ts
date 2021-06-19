import {
  OfRecordType,
  BaseFieldDecoratorArgs,
  RecordClassMetadata,
  Prototype,
} from '../types'
import {
  determineFieldMetadataFromProps,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

type OfType<T> = OfRecordType<T>

/**
 * Marks a record field as avro record schema.
 * 
 * @param recordProps A collection of properties to describe the field
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * @Record()
 * export class Origin {
 *   @AvroString()
 *   country: string
 * 
 *   @AvroString()
 *   state: string
 * }
 * 
 * @Record()
 * export class Fruit {
 *   @AvroRecord({ ofType: () => Origin })
 *   origin: Origin
 * }
 * ```
 */
export function AvroRecord<T>(
  recordProps: {
    /** A thunk resolving the inner record. Example: `ofType: () => Origin` */
    ofType: () => OfType<T>
  } & BaseFieldDecoratorArgs<T>
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(
      propertyKey,
      recordProps
    )
    const typeMetadata: RecordClassMetadata = {
      typeName: 'record-type',
      class: recordProps.ofType(),
      nullable: recordProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
