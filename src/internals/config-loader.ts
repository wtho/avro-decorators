import yargs from 'yargs/yargs'
import { Config } from '../types'
import { absolute } from './path-utils'
import { isAvroDecoratedModel } from './model-loader'
import { AvroDecoratorsError } from './avro-decorators.error'
import { Argv } from 'yargs'

const validCommands = ['generate'] as const
type Command = typeof validCommands[number]

export async function parseArgs(args: string[]): Promise<{
  parsedYargs: Argv<{ config: string }>
  command: Command
}> {
  const parsedYargs = yargs(args)
    .option('config', {
      alias: 'c',
      type: 'string',
      description: 'path to the configuration file',
    })
    .command('generate', 'write model schemas to local files', {
      dryRun: { type: 'boolean' },
    })
    .demandCommand(
      1,
      1,
      'One of the above commands must be specified',
      'Only one command can be specified'
    )
    .strict()
    .help('h')
    .showHelpOnFail(true)

  const argv = await parsedYargs.argv

  const command = `${argv._[0]}` as Command

  return { parsedYargs, command }
}

export function loadConfig(configLocation?: string): { config: Config } {
  const configFileInput = configLocation ?? 'avro-decorators.config.ts'
  const configFilePath = absolute(configFileInput)

  let config: Config

  try {
    const configRequired = require(configFilePath)
    if ('default' in configRequired && configRequired.default.models) {
      config = configRequired.default
    } else {
      config = configRequired
    }
  } catch (err) {
    if (err.name === 'TSError') {
      throw new AvroDecoratorsError(
        `Could not load config file from ${configFilePath} due to TypeScript compilation error:\n${err.message}`
      )
    } else {
      throw new AvroDecoratorsError(
        `Could not load config file from ${configFilePath}\n\n${err.message}`
      )
    }
  }

  validateConfig(config, configFilePath)

  if (config.outDir) {
    config.outDir = absolute(config.outDir)
  }

  return { config }
}

export function validateConfig(config: Config, configFilePath: string) {
  if (!config || typeof config !== 'object') {
    throw new AvroDecoratorsError(
      `ERROR: Config at '${configFilePath}' does not default-export an object like so:\n\nconst config = {};\nexport default config\n`
    )
  }

  const invalidities: string[] = []
  if (!config.models) {
    invalidities.push(`'models' must be defined in config`)
  } else if (
    typeof config.models !== 'object' ||
    !Array.isArray(config.models)
  ) {
    invalidities.push(`'models' defined in config must be an array`)
  } else if (config.models.length === 0) {
    invalidities.push(`'models' defined in config cannot be an empty array`)
  } else {
    config.models.forEach((model, idx) => {
      if (!model.class) {
        invalidities.push(`'models[${idx}].class' must be defined`)
      } else if (
        typeof model.class !== 'function' ||
        !(model.class as any).constructor ||
        !(model.class as any).prototype.constructor
      ) {
        invalidities.push(`'models[${idx}].class' must be a class`)
      } else if (!isAvroDecoratedModel(model.class)) {
        invalidities.push(
          `'models[${idx}].class' must be a model decorated with the avro decorator '@Record(...)'`
        )
      }
      if (model.avscFileName && typeof model.avscFileName !== 'string') {
        invalidities.push(
          `if defined, 'models[${idx}].avscFileName' must be a string`
        )
      }
    })
  }
  if (config.outDir && typeof config.outDir !== 'string') {
    invalidities.push(`if defined, 'outDir' must be a string`)
  }

  if (invalidities.length > 0) {
    throw new AvroDecoratorsError(
      `The configuration loaded from ${configFilePath} contains some errors:\n${invalidities
        .map((inv) => `* ${inv}`)
        .join('\n')}`
    )
  }
}
