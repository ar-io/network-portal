import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const SENTRY_DSN_PUBLIC_KEY = import.meta.env.VITE_SENTRY_DSN_PUBLIC_KEY;
const SENTRY_DSN_PROJECT_URI = import.meta.env.VITE_SENTRY_DSN_PROJECT_URI;
const SENTRY_DSN_PROJECT_ID = import.meta.env.VITE_SENTRY_DSN_PROJECT_ID;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT ?? 'develop';

const sentry =
  SENTRY_DSN_PUBLIC_KEY && SENTRY_DSN_PROJECT_URI && SENTRY_DSN_PROJECT_ID
    ? Sentry.init({
        dsn: `https://${SENTRY_DSN_PUBLIC_KEY}@${SENTRY_DSN_PROJECT_URI}/${SENTRY_DSN_PROJECT_ID}`,
        integrations: [
          Sentry.reactRouterV6BrowserTracingIntegration({
            useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes,
          }),
        ],
        tracesSampleRate: 1.0,
        environment: ENVIRONMENT,
        beforeSend(event: Sentry.Event) {
          if (shouldFilterEvent(event)) {
            return null;
          }
          return sanitizeEvent(event);
        },
        beforeSendTransaction(event: any) {
          if (shouldFilterEvent(event)) {
            return null;
          }
          return sanitizeEvent(event);
        },
      })
    : {};

export default sentry;

// filters messages from ethereum wallets that attempt to inject ethereum multiple times
const filterMessages = new Set(['Cannot redefine property: ethereum']);

const shouldFilterEvent = (event: Sentry.Event): boolean => {
  const isFiltered = [...filterMessages].some((message) =>
    event.exception?.values?.some((value: any) =>
      value.value?.toLowerCase().includes(message.toLowerCase()),
    ),
  );

  return isFiltered;
};

const sanitizeEvent = (event: Sentry.Event): Sentry.Event | null => {
  // Remove user's IP address
  if (event.request) {
    if (event.request.headers) {
      delete event.request.headers['X-Forwarded-For'];
    }
    if (event.request.env) {
      delete event.request.env['REMOTE_ADDR'];
    }
  }

  // Remove user details
  if (event.user) {
    delete event.user; // Remove user object
  }

  return event;
};
