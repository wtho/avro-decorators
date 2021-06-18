import { Schema } from '../avro.types'
import { Config, Constructable, Logger } from '../types'
import * as path from 'path'
import { promises as fs } from 'fs'
import { avroSchemaFromClass } from '../schema-builder'
import {
  getSchemaStringName,
  isSchemaValid,
} from '../internals/avro-helper'

export interface LoadedModel {
  valid: boolean
  schema: Schema
  class: Constructable<unknown>
  name: string
  fileName: string
}

export async function getModels(
  models: Config['models']
): Promise<LoadedModel[]> {
  return models.map((model) => {
    const schema = avroSchemaFromClass(model.class)
    const valid = isSchemaValid(schema)
    const name = getSchemaStringName(schema)
    const fileName = model.avscFileName ?? `${name}.avsc`
    return {
      valid,
      schema,
      class: model.class,
      name,
      fileName,
    }
  })
}

export function isAvroDecoratedModel(model: Constructable<unknown>): boolean {
  if (!model) {
    return false
  }
  const metadata = Reflect.getMetadata('avro-type', model)
  if (!metadata) {
    return false
  }
  if (!metadata.name) {
    return false
  }
  return true
}

export async function writeSchemas(
  models: LoadedModel[],
  outDir: string,
  logger: Logger
): Promise<void> {
  const modelsToWrite = models.filter(
    (model) => model.valid && !!model.fileName
  )
  if (modelsToWrite.length === 0) {
    logger.warn('No valid models found to write')
    return
  }
  logger.log(`Writing ${modelsToWrite.length} files...`)
  for (const model of modelsToWrite) {
    const outFilePath = path.join(outDir, model.fileName)
    const writeableModel = stringifySchema(model.schema)
    await fs.mkdir(path.dirname(outFilePath), { recursive: true })
    await fs.writeFile(outFilePath, writeableModel)
    logger.log(
      ` * wrote ${getSchemaStringName(model.schema)} to ${model.fileName}`
    )
  }
}

export function printSchemas(models: LoadedModel[], logger: Logger): void {
  const modelsToPrint = models.filter((model) => model.valid)
  if (modelsToPrint.length === 0) {
    logger.warn('No valid models found to print')
    return
  }
  logger.log(
    `Printing schemas to stdout, as option 'outDir' is not set in config\n`
  )
  logger.log(
    modelsToPrint
      .map(
        (model) =>
          `${model.name} - ${model.fileName}\n\n${stringifySchema(
            model.schema
          )}\n\n`
      )
      .join('\n')
  )
}

export function stringifySchema(schema: Schema): string {
  return `${JSON.stringify(schema, null, 2)}\n`
}
