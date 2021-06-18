import {
  BaseFieldDecoratorArgs,
  MapMetadata,
  OfPrimitiveRefOrRecordType,
  Prototype,
} from '../types'
import {
  determineFieldMetadataFromProps,
  resolvePrimitiveRefOrRecordType,
  storeAvroFieldReflectionMetadata,
  storeAvroFieldTypeReflectionMetadata,
} from '../internals/decorator-utils'

type OfType<T> = OfPrimitiveRefOrRecordType<T>

export function AvroMap<T>(
  mapProps: {
    ofType: OfType<T>
    mapDefault?: Record<string, T>
  } & BaseFieldDecoratorArgs<Record<string, T>>
): (target: Prototype, propertyKey: string) => void {
  return function (target: Prototype, propertyKey: string) {
    const fieldMetadata = determineFieldMetadataFromProps(propertyKey, mapProps)
    const typeMetadata: MapMetadata = {
      typeName: 'map-type',
      values: resolvePrimitiveRefOrRecordType(mapProps.ofType),
      default: mapProps.mapDefault,
      nullable: mapProps?.nullable ?? false,
    }

    storeAvroFieldReflectionMetadata(fieldMetadata, target, propertyKey)
    storeAvroFieldTypeReflectionMetadata(typeMetadata, target, propertyKey)
  }
}
