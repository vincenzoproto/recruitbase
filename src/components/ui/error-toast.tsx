import { toast } from "sonner";

export const showErrorToast = (message: string, details?: string) => {
  toast.error(message, {
    description: details,
    duration: 4000,
  });
};

export const showSuccessToast = (message: string, details?: string) => {
  toast.success(message, {
    description: details,
    duration: 3000,
  });
};

export const showInfoToast = (message: string, details?: string) => {
  toast.info(message, {
    description: details,
    duration: 3000,
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};
