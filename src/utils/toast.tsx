import { ToastCloseIcon } from '@src/components/icons';
import { log } from '@src/constants';
import toast from 'react-hot-toast';

export const showErrorToast = (message: string) => {
  log.error(message);
  toast.custom((t) => {
    return (
      <div className="flex max-w-[18.75rem] items-start rounded-xl bg-gradient-to-r from-gradient-red-start to-gradient-red-end px-3 py-2 text-sm text-neutrals-1100">
        <div>{message}</div>
        <button className="pl-2" onClick={() => toast.dismiss(t.id)}>
          <ToastCloseIcon className="size-5" />
        </button>
      </div>
    );
  });
};
