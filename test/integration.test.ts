import 'reflect-metadata'
import { Schema } from '../src/avro.types'
import {
  AvroArray,
  AvroBoolean,
  AvroBytes,
  AvroDouble,
  AvroEnum,
  AvroFloat,
  AvroInt,
  AvroLong,
  AvroMap,
  AvroNull,
  AvroRecord,
  AvroReferenceByName,
  AvroString,
  AvroUnion,
  Record,
} from '../src/decorators'
import { avroSchemaFromClass } from '../src/schema-builder'
import { Constructable } from '../src/types'

@Record()
class RecordWithoutFields {}
const recordWithoutFields: Schema = {
  type: 'record',
  name: 'RecordWithoutFields',
  fields: [],
}

@Record({
  namespace: 'test.avro',
  name: 'TestModel',
  aliases: ['TestingModel'],
  description: 'This is just a test model',
})
class RecordWithClassDecoratorData {}
const recordWithNamespace: Schema = {
  type: 'record',
  name: 'TestModel',
  namespace: 'test.avro',
  aliases: ['TestingModel'],
  doc: 'This is just a test model',
  fields: [],
}

@Record()
class RecordPrimitiveTypeFields {
  @AvroNull()
  justNull: null

  @AvroBoolean()
  justBoolean: boolean

  @AvroBytes()
  justBytes: string

  @AvroDouble()
  justDouble: number

  @AvroFloat()
  justFloat: number

  @AvroInt()
  justInt: number

  @AvroLong()
  justLong: number

  @AvroString()
  justString: string
}
const recordPrimitiveTypeFields: Schema = {
  type: 'record',
  name: 'RecordPrimitiveTypeFields',
  fields: [
    { name: 'justNull', type: 'null' },
    { name: 'justBoolean', type: 'boolean' },
    { name: 'justBytes', type: 'bytes' },
    { name: 'justDouble', type: 'double' },
    { name: 'justFloat', type: 'float' },
    { name: 'justInt', type: 'int' },
    { name: 'justLong', type: 'long' },
    { name: 'justString', type: 'string' },
  ],
}

@Record()
class RecordComplexTypeFields {
  @AvroArray({ ofType: 'null' })
  justArray: null[]

  @AvroMap({ ofType: 'null' })
  justMap: Record<string, null>

  @AvroEnum({ name: 'Alphabet', symbols: ['a', 'b', 'c'] })
  justEnum: 'a' | 'b' | 'c'

  @AvroRecord({
    ofType: () => {
      @Record()
      class InnerRecord {}
      return InnerRecord
    },
  })
  justRecord: {}

  @AvroUnion({}, [
    'null',
    () => {
      @Record()
      class InnerRecord {}
      return InnerRecord
    },
    'int',
  ])
  justUnion?: {} | number
}
const recordComplexTypeFields: Schema = {
  type: 'record',
  name: 'RecordComplexTypeFields',
  fields: [
    { name: 'justArray', type: { type: 'array', items: 'null' } },
    { name: 'justMap', type: { type: 'map', values: 'null' } },
    {
      name: 'justEnum',
      type: { name: 'Alphabet', type: 'enum', symbols: ['a', 'b', 'c'] },
    },
    {
      name: 'justRecord',
      type: { name: 'InnerRecord', type: 'record', fields: [] },
    },
    {
      name: 'justUnion',
      type: [
        'null',
        { name: 'InnerRecord', type: 'record', fields: [] },
        'int',
      ],
    },
  ],
}

@Record()
class RecordReferencedTypeField {
  @AvroReferenceByName({ reference: 'LinkedList' })
  aList: any

  @AvroReferenceByName({ reference: 'LinkedList', nullable: true })
  optionalList?: any
}
const recordReferencedTypeField: Schema = {
  type: 'record',
  name: 'RecordReferencedTypeField',
  fields: [
    { name: 'aList', type: 'LinkedList' },
    { name: 'optionalList', type: ['null', 'LinkedList'] },
  ],
}

const testCases: {
  decoratedClass: Constructable<unknown>
  expectedSchema: Schema
  name: string
}[] = [
  {
    name: 'recordWithoutFields',
    decoratedClass: RecordWithoutFields,
    expectedSchema: recordWithoutFields,
  },
  {
    name: 'recordWithNamespace',
    decoratedClass: RecordWithClassDecoratorData,
    expectedSchema: recordWithNamespace,
  },
  {
    name: 'recordPrimitiveTypeFields',
    decoratedClass: RecordPrimitiveTypeFields,
    expectedSchema: recordPrimitiveTypeFields,
  },
  {
    name: 'recordComplexTypeFields',
    decoratedClass: RecordComplexTypeFields,
    expectedSchema: recordComplexTypeFields,
  },
  {
    name: 'recordReferencedTypeField',
    decoratedClass: RecordReferencedTypeField,
    expectedSchema: recordReferencedTypeField,
  },
]

describe('integration', () => {
  test.each(testCases)(
    'reads schema for %s',
    ({ decoratedClass, expectedSchema }) => {
      const actualSchema = avroSchemaFromClass(decoratedClass)
      expect(actualSchema).toEqual(expectedSchema)
    }
  )
})
