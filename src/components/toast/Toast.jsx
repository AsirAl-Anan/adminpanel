import React from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

// Custom toast component wrapper
const CustomToast = ({ type, message, closeToast }) => {
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${config.bgColor} ${config.borderColor} shadow-sm`}>
      <div className="flex items-center gap-3">
        {config.icon}
        <span className={`font-medium text-sm ${config.textColor}`}>
          {message}
        </span>
      </div>
      <button
        onClick={closeToast}
        className={`${config.textColor} hover:opacity-70 transition-opacity ml-4 flex-shrink-0`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast notification functions
const showSuccessToast = (message = "Changes applied successfully") => {
  toast(<CustomToast type="success" message={message} />, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    closeButton: false
  });
};

const showWarningToast = (message = "Entry unpublished") => {
  toast(<CustomToast type="warning" message={message} />, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    closeButton: false
  });
};

const showErrorToast = (message = "Could not apply changes") => {
  toast(<CustomToast type="error" message={message} />, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    closeButton: false
  });
};

const showInfoToast = (message = "Entry saved") => {
  toast(<CustomToast type="info" message={message} />, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    closeButton: false
  });
};
<section class="Toastify" aria-live="polite" aria-atomic="false" aria-relevant="additions text" aria-label="Notifications Alt+T"><div tabindex="-1" class="Toastify__toast-container Toastify__toast-container--top-center"><div id="2" tabindex="0" data-in="true" class="Toastify__toast Toastify__toast-theme--light Toastify__toast--default" role="alert" style="transition: transform 0.2s, opacity 0.2s;"><div class="flex items-center justify-between p-3 rounded-lg border bg-blue-50 border-blue-200 shadow-sm"><div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info w-5 h-5 text-blue-600" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg><span class="font-medium text-sm text-blue-800">Original image used (no crop).</span></div><button class="text-blue-800 hover:opacity-70 transition-opacity ml-4 flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></div><div class="Toastify__progress-bar--wrp" data-hidden="true"><div class="Toastify__progress-bar--bg Toastify__progress-bar-theme--light Toastify__progress-bar--default"></div><div role="progressbar" aria-hidden="true" aria-label="notification timer" class="Toastify__progress-bar Toastify__progress-bar--animated Toastify__progress-bar-theme--light Toastify__progress-bar--default" style="animation-duration: 5000ms; animation-play-state: paused;"></div></div></div></div></section>
export { showSuccessToast, showWarningToast, showErrorToast, showInfoToast };