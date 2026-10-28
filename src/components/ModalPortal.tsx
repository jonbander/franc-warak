import React from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const modalRoot = typeof document === 'undefined'
    ? null
    : document.getElementById('fw-modal-root');

  return modalRoot ? createPortal(children, modalRoot) : <>{children}</>;
};
