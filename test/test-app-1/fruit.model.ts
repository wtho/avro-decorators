import {
  AvroArray,
  AvroEnum,
  AvroMap,
  AvroRecord,
  AvroInt,
  AvroString,
  Record,
} from '../../src/decorators'

const fruitTypes = ['berry', 'tropical'] as const
type FruitType = typeof fruitTypes[number]

@Record({
  description: 'An origin location',
  namespace: 'fruits.meta',
})
export class Origin {
  @AvroString({ description: 'The continent the fruit is originally from' })
  continent: string
}

@Record()
export class Fruit {
  @AvroInt()
  id: number

  @AvroString({ description: 'The name of the fruit' })
  name: string

  @AvroRecord({ ofType: () => Origin, description: 'The origin of the fruit' })
  origin: Origin

  @AvroEnum({ name: 'FruitType', symbols: fruitTypes })
  fruitType: FruitType

  @AvroArray({ ofType: () => 'string', default: [] })
  flavours: string[]

  @AvroMap({ ofType: () => 'int' })
  inventory: Record<string, number>
}
