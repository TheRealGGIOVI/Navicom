import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'Entendido',
    cancelText: null,
    resolve: null,
  });

  // Remove toast by ID
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Show a floating toast notification
  const showToast = useCallback(({ type = 'info', title = '', message = '', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  // Shorthands for toasts
  const toast = {
    success: (message, title = '¡Completado!') => showToast({ type: 'success', title, message }),
    error: (message, title = 'Atención') => showToast({ type: 'error', title, message }),
    warning: (message, title = 'Aviso') => showToast({ type: 'warning', title, message }),
    info: (message, title = 'Información') => showToast({ type: 'info', title, message }),
  };

  // Show a prominent centered modal dialog (replaces native alert/confirm)
  const showAlert = useCallback(({ type = 'info', title = '', message = '', confirmText = 'Aceptar' }) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type,
        title: title || (type === 'error' ? 'Ha ocurrido un error' : type === 'success' ? 'Operación exitosa' : 'Aviso'),
        message,
        confirmText,
        cancelText: null,
        resolve,
      });
    });
  }, []);

  const showConfirm = useCallback(({ type = 'warning', title = '¿Estás seguro?', message = '', confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type,
        title,
        message,
        confirmText,
        cancelText,
        resolve,
      });
    });
  }, []);

  const handleModalConfirm = () => {
    if (modal.resolve) modal.resolve(true);
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleModalCancel = () => {
    if (modal.resolve) modal.resolve(false);
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Intercept native window.alert globally so that even third-party or unmigrated alert() calls use the modern popup!
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      // Intelligently infer type from message content
      const lower = String(msg || '').toLowerCase();
      let inferredType = 'info';
      let inferredTitle = 'Notificación';

      if (lower.includes('éxito') || lower.includes('exito') || lower.includes('guardado') || lower.includes('añadido')) {
        inferredType = 'success';
        inferredTitle = '¡Genial!';
      } else if (lower.includes('error') || lower.includes('fallo') || lower.includes('agotado') || lower.includes('inválid')) {
        inferredType = 'error';
        inferredTitle = 'Atención';
      } else if (lower.includes('disponible') || lower.includes('seleccionar')) {
        inferredType = 'warning';
        inferredTitle = 'Aviso';
      }

      showToast({
        type: inferredType,
        title: inferredTitle,
        message: String(msg),
        duration: 4500,
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        modal,
        showToast,
        toast,
        showAlert,
        showConfirm,
        removeToast,
        handleModalConfirm,
        handleModalCancel,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
