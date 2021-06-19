import { Constructable, RecordMetadata } from '../types'

/**
 * Avro record class decorator to declare an avro record type, which can be
 * the root of an avro schema or referenced in another record as a field.
 * 
 * To make the record yield an own .avsc schema file, reference it in the
 * avro-decorators config in the models array.
 * 
 * @param props A collection of optional properties to describe your schema
 * and gain granular control of metadata in the generated Avro Schema file.
 * 
 * Example:
 * ```typescript
 * @Record({ name: "Fruit", typeDoc: "An edible, sweet fruit" })
 * export class Fruit {
 *   @AvroString()
 *   origin: string;
 * }
 * ```
 */
export const Record = (props?: {
  /** The name of the record schema. If not set, the class name is inherited. */
  name?: string
  /** Dot-separated sequence of names to qualify the record name. */
  namespace?: string
  /** A string providing documentation to the user of this schema. */
  typeDoc?: string
  /** An array of strings, providing alternate names for this record. */
  aliases?: string[]
}) => (target: Constructable<unknown>) => {
  const recordMetadata: RecordMetadata = {
    name: props?.name ?? target.name,
  }
  if (props?.namespace) {
    recordMetadata.namespace = props.namespace
  }
  if (props?.typeDoc) {
    recordMetadata.doc = props.typeDoc
  }
  if (props?.aliases) {
    recordMetadata.aliases = props.aliases
  }
  Reflect?.defineMetadata?.('avro-type', recordMetadata, target)
}
