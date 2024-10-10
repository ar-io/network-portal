// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import '@testing-library/jest-dom';
import 'core-js';
import 'jest-location-mock';
// was needed for github actions environment
import React from 'react';
import { TextDecoder, TextEncoder } from 'util';

global.React = React;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.fetch = require('node-fetch');
// forcefully mock crypto
Object.defineProperty(global, 'crypto', {
    value: {
      subtle: {
        digest: jest.fn(),
        generateKey: jest.fn(),
        importKey: jest.fn(),
        exportKey: jest.fn(),
        sign: jest.fn(),
      },
    },
  });
