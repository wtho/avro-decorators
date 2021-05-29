import { AvroOrder, BasicAvroType, PrimitiveAvroType } from './avro.types'

export type ClassType = Boolean | Number | String | Constructable<unknown>
export type OfType<T = unknown> = PrimitiveAvroType | Constructable<T>
export type Optional<T, K extends keyof T> = Partial<T> & Omit<T, K>
export type Constructable<T> = new () => T

export type BaseDecoratorArgs<D> = {
  description?: string
  avroOverrideName?: string
  order?: AvroOrder
  aliases?: string[]
  nullable?: boolean
  default?: D
}

export interface BaseTypeMetadata<T> {
  typeName: BasicAvroType | 'reference'
  nullable?: boolean

  name?: string
  doc?: string
  order?: AvroOrder
  aliases?: string[]
  default?: T
}

export interface RecordMetadata<T extends object> extends BaseTypeMetadata<T> {
  namespace?: string
}

export interface Config {
  models: {
    class: Constructable<unknown>
    avscFileName?: string
  }[]
  outDir?: string
}

export type Logger = Pick<typeof console, 'debug' | 'log' | 'info' | 'warn' | 'error'>
