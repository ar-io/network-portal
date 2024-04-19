import { defaultLogger } from '@src/constants';
import axios, {
  AxiosInstance,
  AxiosProgressEvent,
  AxiosRequestConfig,
  CanceledError,
} from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

import { FailedRequestError, HTTPClient } from '../../types';
import { Logger } from 'winston'


export class AxiosHTTPService implements HTTPClient {
  private axios: AxiosInstance;
  private logger: Logger;

  // TODO: re-implement axios-retry. Currently that package is broken for nodenext.
  constructor({ url, logger }: { url: string; logger: Logger }) {
    this.logger = logger;
    this.axios = createAxiosInstance({
      axiosConfig: {
        baseURL: url,
        maxRedirects: 0, // prevents backpressure issues when uploading larger streams via https
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          this.logger.debug(`Uploading...`, {
            percent: Math.floor((progressEvent.progress ?? 0) * 100),
            loaded: `${progressEvent.loaded} bytes`,
            total: `${progressEvent.total} bytes`,
          });
          if (progressEvent.progress === 1) {
            this.logger.debug(`Upload complete!`);
          }
        },
      },
    });
  }
  async get<T>({
    endpoint,
    signal,
    allowedStatuses = [200, 202],
    headers,
  }: {
    endpoint: string;
    signal?: AbortSignal;
    allowedStatuses?: number[];
    headers?: Record<string, string>;
  }): Promise<T> {
    const { status, statusText, data } = await this.axios.get<T>(endpoint, {
      headers,
      signal,
    });

    if (!allowedStatuses.includes(status)) {
      throw new FailedRequestError(status, statusText);
    }

    return data;
  }

  async post<T>({
    endpoint,
    signal,
    allowedStatuses = [200, 202],
    headers,
    data,
  }: {
    endpoint: string;
    signal?: AbortSignal;
    allowedStatuses?: number[];
    headers?: Record<string, string>;
    data: Readable | Buffer | ReadableStream;
  }): Promise<T> {
    const {
      status,
      statusText,
      data: response,
    } = await this.axios.post<T>(endpoint, data, {
      headers,
      signal,
    });

    if (!allowedStatuses.includes(status)) {
      throw new FailedRequestError(status, statusText);
    }

    return response;
  }
}

export interface AxiosInstanceParameters {
  axiosConfig?: Omit<AxiosRequestConfig, 'validateStatus'>;
  retryConfig?: IAxiosRetryConfig;
  logger?: Logger;
}

export const createAxiosInstance = ({
  logger = defaultLogger,
  axiosConfig = {},
  retryConfig = {
    retryDelay: axiosRetry.exponentialDelay,
    retries: 3,
    retryCondition: (error) => {
      return (
        !(error instanceof CanceledError) &&
        axiosRetry.isNetworkOrIdempotentRequestError(error)
      );
    },
    onRetry: (retryCount, error) => {
      logger.debug(`Request failed, ${error}. Retry attempt #${retryCount}...`);
    },
  },
}: AxiosInstanceParameters = {}): AxiosInstance => {
  const axiosInstance = axios.create({
    ...axiosConfig,
    headers: {
      ...axiosConfig.headers,
    },
    validateStatus: () => true, // don't throw on non-200 status codes
  });

  // eslint-disable-next-line
  if (retryConfig.retries && retryConfig.retries > 0) {
    axiosRetry(axiosInstance, retryConfig);
  }
  return axiosInstance;
};
