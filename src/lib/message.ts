import { toast } from 'sonner';

export const message = {
  success: (content: string, duration = 2000) =>
    toast.success(content, { duration }),

  error: (content: string, duration = 2000) =>
    toast.error(content, { duration }),

  info: (content: string, duration = 2000) =>
    toast(content, { duration }),

  warning: (content: string, duration = 2000) =>
    toast.warning(content, { duration }),

  loading: (content: string) => {
    const id = toast.loading(content);
    return {
      close: () => toast.dismiss(id),
      update: (newContent: string) => toast.message(newContent, { id }),
    };
  },
};
