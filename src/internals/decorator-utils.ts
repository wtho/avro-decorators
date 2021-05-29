import { BaseDecoratorArgs, BaseTypeMetadata, Optional } from '../types'

export function storeAvroFieldTypeReflectionMetadata<
  M extends BaseTypeMetadata<unknown>
>(typeMetadata: M, target: any, propertyKey: string) {
  Reflect?.defineMetadata?.('avro-type', typeMetadata, target, propertyKey)

  const existingPropKeys =
    Reflect?.getMetadata?.('avro-field-names', target) ?? []
  Reflect?.defineMetadata?.(
    'avro-field-names',
    [...existingPropKeys, propertyKey],
    target
  )
}

export function enrichDecoratorMetadata<
  M extends Optional<BaseTypeMetadata<unknown>, 'nullable'>,
  P extends BaseDecoratorArgs<D>,
  D
>(inputTypeMetadata: M, props?: P & { namespace?: string }): M {
  let typeMetadata: M = {
    ...inputTypeMetadata,
    nullable: !!props?.nullable
  }
  if (props?.order) {
    typeMetadata = {
      ...typeMetadata,
      order: props.order,
    }
  }
  if (props?.default !== undefined) {
    typeMetadata = {
      ...typeMetadata,
      default: props.default,
    }
  }
  if (props?.aliases) {
    typeMetadata = {
      ...typeMetadata,
      aliases: props.aliases,
    }
  }
  if (props?.description) {
    typeMetadata = {
      ...typeMetadata,
      doc: props.description,
    }
  }
  if (props?.avroOverrideName) {
    typeMetadata = {
      ...typeMetadata,
      name: props.avroOverrideName,
    }
  }
  if (props?.namespace) {
    typeMetadata = {
      ...typeMetadata,
      namespace: props.namespace,
    }
  }
  return typeMetadata
}

