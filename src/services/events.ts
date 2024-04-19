import EventEmitter from 'eventemitter3';

// error emitter captures errors and sends them to sentry. Can be coupled with a notification API.
export const errorEmitter = new EventEmitter();
export const notificationEmitter = new EventEmitter();
