import React from 'react';
import { useNotification } from '../context/NotificationContext';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaInfoCircle,
  FaTimes
} from 'react-icons/fa';
import './styles/Module.Notification.css';

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
        return <FaCheckCircle className="notif-icon notif-icon-success" />;
      case 'error':
        return <FaTimesCircle className="notif-icon notif-icon-error" />;
      case 'warning':
        return <FaExclamationTriangle className="notif-icon notif-icon-warning" />;
      case 'info':
      default:
        return <FaInfoCircle className="notif-icon notif-icon-info" />;
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
              <FaTimes />
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
