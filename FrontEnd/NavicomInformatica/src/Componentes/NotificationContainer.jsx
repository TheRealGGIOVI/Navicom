import React from 'react';
import { useNotification } from '../context/NotificationContext.jsx';
import './styles/Module.Notification.css';

// Crisp, zero-dependency inline SVGs
const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="notif-icon notif-icon-success">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="notif-icon notif-icon-error">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const WarningIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="notif-icon notif-icon-warning">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const InfoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="notif-icon notif-icon-info">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function NotificationContainer() {
  const {
    toasts,
    modal,
    removeToast,
    handleModalConfirm,
    handleModalCancel
  } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };

  return (
    <>
      {/* Toast Notification Stack */}
      <div className="notif-toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`notif-toast notif-toast-${t.type}`}>
            <div className="notif-toast-icon-wrapper">
              {getIcon(t.type)}
            </div>
            <div className="notif-toast-body">
              {t.title && <h4 className="notif-toast-title">{t.title}</h4>}
              <p className="notif-toast-message">{t.message}</p>
            </div>
            <button
              className="notif-toast-close"
              onClick={() => removeToast(t.id)}
              aria-label="Cerrar notificación"
            >
              <CloseIcon />
            </button>
            {t.duration > 0 && (
              <div
                className="notif-toast-progress"
                style={{ animationDuration: `${t.duration}ms` }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Modern Modal Popup Alert / Confirm Dialog */}
      {modal.isOpen && (
        <div className="notif-modal-overlay" onClick={handleModalCancel}>
          <div
            className={`notif-modal notif-modal-${modal.type}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={`notif-modal-icon-badge notif-badge-${modal.type}`}>
              {getIcon(modal.type)}
            </div>

            <h3 className="notif-modal-title">{modal.title}</h3>
            <p className="notif-modal-message">{modal.message}</p>

            <div className="notif-modal-actions">
              {modal.cancelText && (
                <button
                  type="button"
                  className="notif-btn notif-btn-cancel"
                  onClick={handleModalCancel}
                >
                  {modal.cancelText}
                </button>
              )}
              <button
                type="button"
                className={`notif-btn notif-btn-confirm notif-btn-${modal.type}`}
                onClick={handleModalConfirm}
                autoFocus
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
