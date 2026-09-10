'use client';

import * as React from 'react';
import { Modal } from '@heroui/react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

/** Provides controlled HeroUI modal state to a trigger and dialog content. */
export function Dialog({ children, onOpenChange, open }: DialogProps) {
  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      {children}
    </Modal>
  );
}

/** Renders the backdrop, responsive container, dialog surface, and close affordance. */
export function DialogContent({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Modal.Dialog>, 'children'> & {
  children: React.ReactNode;
}) {
  return (
    <Modal.Backdrop className="lib-dialog-overlay">
      <Modal.Container
        className="lib-dialog-container"
        placement="auto"
        scroll="inside"
        size="lg"
      >
        <Modal.Dialog className={cn('lib-dialog', className)} {...props}>
          {children}
          <Modal.CloseTrigger
            aria-label="Close"
            className="lib-dialog__close"
          />
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

/** Groups a dialog heading and its optional description. */
export function DialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof Modal.Header>) {
  return (
    <Modal.Header className={cn('lib-dialog__head', className)} {...props} />
  );
}

/** Provides the scrollable content region of a dialog. */
export function DialogBody({
  className,
  ...props
}: React.ComponentProps<typeof Modal.Body>) {
  return (
    <Modal.Body className={cn('lib-dialog__body', className)} {...props} />
  );
}

/** Supplies the accessible heading for a dialog. */
export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof Modal.Heading>) {
  return (
    <Modal.Heading className={cn('lib-dialog__title', className)} {...props} />
  );
}

/** Adds supporting text below a dialog heading. */
export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('lib-dialog__desc', className)} {...props} />;
}
