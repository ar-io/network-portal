export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class FailedRequestError extends BaseError {
  constructor(status: number, message: string) {
    super(`Failed request: ${status}: ${message}`);
  }
}
