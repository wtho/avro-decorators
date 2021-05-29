import { Constructable, RecordMetadata } from '../types'
import { AvroOrder } from '../avro.types'

export const Record = (props?: {
  namespace?: string
  name?: string
  description?: string
  aliases?: string[]
  order?: AvroOrder
  // subject?: string
}) => (target: Constructable<unknown>) => {
  let avroTypeMetadata: RecordMetadata<object> = {
    typeName: 'record',
    name: props?.name ?? target.name,
  }
  if (props?.namespace) {
    avroTypeMetadata = {
      ...avroTypeMetadata,
      namespace: props.namespace,
    }
  }
  if (props?.description) {
    avroTypeMetadata = {
      ...avroTypeMetadata,
      doc: props.description,
    }
  }
  if (props?.order) {
    avroTypeMetadata = {
      ...avroTypeMetadata,
      doc: props.order,
    }
  }
  if (props?.aliases) {
    avroTypeMetadata = {
      ...avroTypeMetadata,
      aliases: props.aliases,
    }
  }
  Reflect?.defineMetadata?.('avro-type', avroTypeMetadata, target)
  // if (props?.subject) {
  //   Reflect.defineMetadata('avro-subject', props.subject, target)
  // }
}
