import * as path from 'path'

export function absolute(filePath: string): string {
  if (path.isAbsolute(filePath)) {
    return filePath
  }
  return path.resolve(filePath)
}
