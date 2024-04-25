import { captureException } from '@sentry/browser';
import { errorEmitter, notificationEmitter } from '@src/services/events.js';
import { useEffect } from 'react';

function Notifications() {
  useEffect(() => {
    notificationEmitter.on('notification', (notification) => {
      console.log(notification);
    });

    errorEmitter.on('error', (error) => {
      captureException(error);
    });

    return () => {
      notificationEmitter.removeAllListeners();
      errorEmitter.removeAllListeners();
    };
  }, []);

  return <></>;
}

export default Notifications;
