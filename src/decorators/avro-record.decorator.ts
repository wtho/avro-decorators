import { OfType, BaseDecoratorArgs, ClassType, BaseTypeMetadata } from '../types'
import {
  enrichDecoratorMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

export function AvroRecord<T>(
  isRecordProps: {
    ofType: () => OfType<T>,
  } & BaseDecoratorArgs<T>
): (target: any, propertyKey: string) => void {
  return function (target: any, propertyKey: string) {
    const typeMetadata: {
      recordType: ClassType
    } & BaseTypeMetadata<T> = enrichDecoratorMetadata(
      { typeName: 'record', recordType: isRecordProps.ofType() },
      isRecordProps
    )

    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
