// NotificationOnlyError is an error that is only shown as a notification and does not emit to sentry
export class NotificationOnlyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Error Notification';
  }
}

export class ValidationError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Validation Error';
  }
}

export class WanderError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Wander';
  }
}

export class MetamaskError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Metamask';
  }
}

export class InsufficientFundsError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Insufficient Funds';
  }
}

export class WalletNotInstalledError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Wallet Not Installed';
  }
}
