import { Config } from '../src/types'
import { Fruit } from './fruit.model'

const config: Config = {
  models: [{ class: Fruit }],
  outDir: 'src/example/schemas'
}

export default config
