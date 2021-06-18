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

export function AvroRecord<T>(
  recordProps: {
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
