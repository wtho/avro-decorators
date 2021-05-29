import * as path from 'path'
import { absolute } from './path-utils'

describe('path-utils', () => {
  describe('absolute', () => {
    test('returns the same path when it is already absolute', () => {
      const pathToCheck = '/some/absolute/path'

      const absolutized = absolute(pathToCheck)

      expect(absolutized).toEqual('/some/absolute/path')
    })

    test('returns an absolute path for a relative input', () => {
      const pathToCheck = 'some/relative/path'

      const absolutized = absolute(pathToCheck)

      const resolveBasePath = path.resolve('.')

      expect(absolutized).toEqual(`${resolveBasePath}/some/relative/path`)
    })

    test('returns base dir for empty input', () => {
      const pathToCheck = ''

      const absolutized = absolute(pathToCheck)

      const resolveBasePath = path.resolve('.')

      expect(absolutized).toEqual(resolveBasePath)
    })
  })
})
