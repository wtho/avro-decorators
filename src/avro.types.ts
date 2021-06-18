export type AvroOrder = 'ascending' | 'descending' | 'ignore'
export type PrimitiveAvroType =
  | 'bytes'
  | 'boolean'
  | 'double'
  | 'float'
  | 'int'
  | 'long'
  | 'null'
  | 'string'
export type ComplexAvroType =
  | 'record'
  | 'enum'
  | 'array'
  | 'map'
  | 'union'
  | 'fixed'
export type BasicAvroType = PrimitiveAvroType | ComplexAvroType

export type ComplexSchemaRef = string 
export type DirectSchemaType = PrimitiveAvroType | ComplexSchemaRef

export type PrimitiveSchemaType = { type: PrimitiveAvroType }

export interface RecordSchemaType {
  type: 'record'
  name: string
  namespace?: string
  doc?: string
  aliases?: string[]
  fields: RecordSchemaTypeField[]
}

export interface RecordSchemaTypeField {
  name: string
  doc?: string
  type: Schema
  default?: unknown
  order?: AvroOrder
  aliases?: string[]
}

export interface EnumSchemaType {
  type: 'enum'
  name: string
  namespace?: string
  aliases?: string[]
  doc?: string
  symbols: readonly string[]
  default?: string
}

export interface ArraySchemaType {
  type: 'array'
  items: Schema
  default?: unknown[]
}

export interface MapSchemaType {
  type: 'map'
  values: Schema
  default?: Record<string, unknown>
}

export type UnionSchemaType = Schema[]

export interface FixedSchemaType {
  type: 'fixed'
  name: string
  namespace?: string
  aliases?: string[]
  size: number
}

export type ComplexSchemaType =
  | RecordSchemaType
  | EnumSchemaType
  | ArraySchemaType
  | MapSchemaType
  | UnionSchemaType
  | FixedSchemaType

export type Schema = DirectSchemaType | PrimitiveSchemaType | ComplexSchemaType
