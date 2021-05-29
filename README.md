<h1 align="center">Avro Decorators</h1>

<p align="center">Typescript class decorators to model your avro schema</p>

<p align="center">
    <a href="https://www.npmjs.com/package/avro-decorators"><img src="https://img.shields.io/npm/v/avro-decorators/latest.svg?style=flat-square" alt="NPM Version" /></a>
    <a href="https://actions-badge.atrox.dev/wtho/avro-decorators/goto?ref=master"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fwtho%2Favro-decorators%2Fbadge%3Fref%3Dmain&style=flat-square" /></a>
    <a href="https://github.com/wtho/avro-decorators/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/avro-decorators.svg?style=flat-square" alt="GitHub license" /></a>
</p>

## Getting Started

To model your avro as follows:
```ts
@Record()
export class Fruit {
  @AvroInt()
  id: number

  @AvroString({ description: 'The name of the fruit' })
  name: string
}
```

you need to setup the following

* install `avro-decorators`
  ```
  $ npm install -D avro-decorators
  #   or
  $ yarn add -D avro-decorators
  ```
* create a configuration file `avro-decorators.config.ts` with the following content:
  ```ts
  import { Config } from 'avro-decorators'
  import { Fruit } from './fruit.model'

  const config: Config = {
    models: [
      // reference your models here
      { class: Fruit }
    ],
    // each referenced model will be written to a file
    outDir: 'src/example/schemas'
  }

  export default config
  ```
* finally add the generate script to your package.json and run the script
  ```jsonc
  { // package.json
    "scripts": {
      "generate-avro-models": "avro-decorators generate"
    }
  }
  ```
  ```
  $ npm run generate-avro-models
  #   or
  $ yarn generate-avro-models
  ```

## Configuration
`Avro Decorators` requires a configuration file written in TypeScript, to ensure the models have applied the decorators accordingly to read the required metadata.

The `models` array is mandatory. Each model requires `class` - a reference to the TypeScript class, and an optional filename `avscFileName` to name the schema output file.

Additionaly, an output directory `outDir` can be declared. If it is not specified, the generated schemas will be printed to stdout instead.

### Locating config not in root
By default, `Avro Decorators` will check the current working directory for the file `avro-decorators.config.ts`. If your config is located in a different folder, pass it to the program using the flag `--config <path>` or `-c <path>`.
## Advanced Use Cases

### Namespace
Declare a namespace for a record as seen in the following example. If you want to use a model name different than the class name, you can use the `name` property.

For enum fields you can also declare them in the decorator.
```ts
@Record({
  namespace: 'fruits.meta',
  name: 'FruitModel'
})
export class Fruit {
  @AvroEnum({
    namespace: 'fruits.data',
    name: 'FruitType',
    symbols: fruitTypes
  })
  fruitType: FruitType
}
```
### Different field or record name
To use a different field name in the schema than in the class, you the decorator property `avroOverrideName`:
```ts
  @AvroString({avroOverrideName: 'fieldNameInSchema'})
  fieldNameInClass: string
```
### Nested Records
To use a record inside another record on a field type, you should declare both records independently and then reference it on the field:
```ts
@Record()
export class Address {
  @AvroString()
  street: string
}

@Record()
export class User {
  @AvroRecord({ ofType: () => Address })
  address: Address
}
```
### Reference schema by name
Referencing by name works using the 
```ts
@Record()
export class Fruit {
  @AvroReferenceByName({
    referencedTypeName: 'MyReferencedType'
  })
  field: unknown
}
```
This will result in the schema
```json
{
  "name": "Fruit",
  "type": "record",
  "fields": [
    {
      "name": "field",
      "type": "MyReferencedType"
    }
  ]
}
```
Note that there is no validation if that referenced type actually exists anywhere in this library.

## Features not supported yet
* Union
* Top-level non-record (e. g. enum)
* Validation of `name` and `namespace` according to [specification](https://avro.apache.org/docs/current/spec.html#names)
* Custom tsconfig for model compilation

