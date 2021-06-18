import { Constructable, RecordMetadata } from '../types'

export const Record = (props?: {
  name?: string
  namespace?: string
  description?: string
  aliases?: string[]
}) => (target: Constructable<unknown>) => {
  const recordMetadata: RecordMetadata = {
    name: props?.name ?? target.name,
  }
  if (props?.namespace) {
    recordMetadata.namespace = props.namespace
  }
  if (props?.description) {
    recordMetadata.doc = props.description
  }
  if (props?.aliases) {
    recordMetadata.aliases = props.aliases
  }
  Reflect?.defineMetadata?.('avro-type', recordMetadata, target)
}
