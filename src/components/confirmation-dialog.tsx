'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';

interface ConfirmationOptions {
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmationContextType {
  openConfirmation: (options: ConfirmationOptions) => void;
}

const ConfirmationDialogContext = createContext<ConfirmationContextType | undefined>(undefined);

export const useConfirmation = () => {
  const context = useContext(ConfirmationDialogContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationDialogProvider');
  }
  return context;
};

export const ConfirmationDialogProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openConfirmation = (newOptions: ConfirmationOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (options?.onCancel) {
      options.onCancel();
    }
    handleClose();
  };

  const handleConfirm = async () => {
    if (options?.onConfirm) {
      await options.onConfirm();
    }
    handleClose();
  };

  return (
    <ConfirmationDialogContext.Provider value={{ openConfirmation }}>
      {children}
      {options && (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{options.title}</AlertDialogTitle>
              <AlertDialogDescription>{options.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>
                {options.cancelText || 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button onClick={handleConfirm} variant="destructive">
                  {options.confirmText || 'Confirm'}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ConfirmationDialogContext.Provider>
  );
};
