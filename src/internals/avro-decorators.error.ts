export class AvroDecoratorsError extends Error {
  public readonly avroDecoratorsError = this.message
  constructor(message: string, public readonly showHelp?: boolean) {
    super(message)
  }
}
