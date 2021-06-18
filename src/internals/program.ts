import 'reflect-metadata'
import 'ts-node/register'
import {
  getModels,
  printSchemas,
  writeSchemas,
} from '../internals/model-loader'
import { loadConfig, parseArgs } from '../internals/config-loader'
import { Logger } from '../types'

export async function runAvroDecorators(
  processArgv: string[],
  processExitFn: (code?: number) => never,
  logger: Logger
) {
  let helpPrinter: { showHelp: (consoleLevel?: string) => void }
  try {
    const { parsedYargs, command } = await parseArgs(processArgv.slice(2))
    helpPrinter = parsedYargs
    const argv = await parsedYargs.argv
    const { config } = loadConfig(argv.config)

    const models = await getModels(config.models)

    if (command === 'generate') {
      if (config.outDir) {
        await writeSchemas(models, config.outDir, logger)
      } else {
        printSchemas(models, logger)
      }
    }
  } catch (error) {
    if (error.avroDecoratorsError) {
      logger.error(error.avroDecoratorsError)
      if (error.showHelp && helpPrinter) {
        helpPrinter.showHelp('error')
      }
      processExitFn(1)
    }
    throw error
  }
}
