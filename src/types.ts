import { AvroOrder, DirectSchemaType, PrimitiveAvroType, PrimitiveSchemaType } from './avro.types'

export type ClassType = Boolean | Number | String | Constructable<unknown>
export type OfPrimitiveRefOrRecordType<T = unknown> = PrimitiveAvroType | string | (() => OfRecordType<T>)
export type OfRecordType<T = unknown> = Constructable<T>
export type Optional<T, K extends keyof T> = Partial<T> & Omit<T, K>
export type Constructable<T> = new () => T
export type Prototype<T = unknown> = {
  constructor: Function | Constructable<T>
}

export type InlineUnionTypeDefinition = {
  union: InlineTypeDefinition[]
}

interface InlineEnumTypeDef<E extends string> {
  enum: {
    name: string
    namespace?: string
    typeAliases?: string[]
    typeDoc?: string
    symbols: readonly E[]
    typeDefault?: E
  }
}
interface InlineArrayTypeDef {
  array: {
    items: InlineTypeDefinition
    default?: unknown[]
  }
}
interface InlineMapTypeDef {
  map: {
    values: InlineTypeDefinition
    default?: Record<string, unknown>
  }
}
interface InlineFixedTypeDef {
  fixed: {
    name: string
    namespace?: string
    aliases?: string[]
    size: number
  }
}
type InlineRecordTypeDef<T> = () => OfRecordType<T>

export type InlineTypeDefinition =
  | InlineUnionTypeDefinition
  | DirectSchemaType
  | InlineEnumTypeDef<string>
  | InlineArrayTypeDef
  | InlineMapTypeDef
  | InlineFixedTypeDef
  | InlineRecordTypeDef<unknown>

export type InlineInUnionTypeDefinition =
  | DirectSchemaType
  | InlineEnumTypeDef<string>
  | InlineArrayTypeDef
  | InlineMapTypeDef
  | InlineFixedTypeDef
  | InlineRecordTypeDef<unknown>

export type BaseFieldDecoratorArgs<D> = {
  fieldDoc?: string
  fieldName?: string
  order?: AvroOrder
  fieldAliases?: string[]
  nullable?: boolean
  fieldDefault?: D
}

export interface FieldMetadata<T> {
  name: string
  doc?: string
  default?: T
  order?: AvroOrder
  aliases?: string[]

  nullable?: boolean
}

export type TypeMetadata =
  | PrimitiveDefinedTypeMetadata
  // | PrimitiveTypeMetadata
  | ReferencedTypeMetadata
  | RecordClassMetadata
  | EnumMetadata
  | ArrayMetadata
  | MapMetadata
  | UnionMetadata
  | FixedMetadata

export interface BaseTypeMetadata {
  nullable: boolean
}

export interface PrimitiveDefinedTypeMetadata extends BaseTypeMetadata {
  typeName: 'primitive-defined-type'
  primitiveDefinedType: PrimitiveAvroType
}
// export interface PrimitiveTypeMetadata extends BaseTypeMetadata {
//   typeName: 'primitive-type'
//   primitiveType: PrimitiveSchemaType
// }
export interface ReferencedTypeMetadata extends BaseTypeMetadata {
  typeName: 'referenced-defined-type'
  reference: string
}
export interface RecordClassMetadata extends BaseTypeMetadata {
  typeName: 'record-type'
  class: Constructable<unknown>
}

export interface RecordMetadata {
  name: string
  namespace?: string
  doc?: string
  aliases?: string[]
}
export interface EnumMetadata extends BaseTypeMetadata {
  typeName: 'enum-type'
  name: string
  symbols: readonly string[]
  namespace?: string
  aliases?: string[]
  doc?: string
  default?: string
}
export interface ArrayMetadata extends BaseTypeMetadata {
  typeName: 'array-type'
  items: TypeMetadata
  default?: unknown[]
}

export interface MapMetadata extends BaseTypeMetadata {
  typeName: 'map-type'
  values: TypeMetadata
  default?: Record<string, unknown>
}

export interface UnionMetadata extends BaseTypeMetadata {
  typeName: 'union-type'
  types: TypeMetadata[]
}
export interface FixedMetadata extends BaseTypeMetadata {
  typeName: 'fixed-type'
  name: string
  size: number
  namespace?: string
  aliases?: string[]
}

export interface Config {
  /**
   * An array of dictionaries, for each of your schema files,
   * containing the class and optionally a custom avsc file name.
   */
  models: {
    /** The decorated typescript class of the model */
    class: Constructable<unknown>
    /** 
     * The file name of the generated avsc file.
     * 
     * default: "<model-name>.avsc"
     */
    avscFileName?: string
  }[]
  /**
   * The schema output folder, relative to the current working
   * directory.
   */
  outDir?: string
}

export type Logger = Pick<typeof console, 'debug' | 'log' | 'info' | 'warn' | 'error'>
