import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageReporters: ['html', 'lcov'],
  // do not print console from tested code
  silent: true,
}

export default config
