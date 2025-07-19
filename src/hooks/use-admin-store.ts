"use client";

import { create } from 'zustand';
import type { ContentItem, Lesson } from '@/lib/types';
import { ReactNode } from 'react';

type AdminMode = 'add' | 'edit';
type ItemToEdit = ContentItem | Lesson;
type FormType = ContentItem['type'] | 'lesson';

interface ConfirmationOptions {
  title: string;
  description: ReactNode;
  onConfirm: () => void | Promise<void>;
}

type AdminStore = {
  isOpen: boolean;
  type: FormType | null;
  lessonId: string | null;
  mode: AdminMode;
  itemToEdit: ItemToEdit | null;
  confirmation: ConfirmationOptions | null;
  open: (type: FormType, lessonId?: string | null, mode?: AdminMode, itemToEdit?: ItemToEdit | null) => void;
  close: () => void;
  openConfirmation: (options: ConfirmationOptions) => void;
  closeConfirmation: () => void;
};

export const useAdminStore = create<AdminStore>((set) => ({
  isOpen: false,
  type: null,
  lessonId: null,
  mode: 'add',
  itemToEdit: null,
  confirmation: null,
  open: (type, lessonId = null, mode = 'add', itemToEdit = null) => 
    set({ isOpen: true, type, lessonId, mode, itemToEdit }),
  close: () => 
    set({ isOpen: false, type: null, lessonId: null, mode: 'add', itemToEdit: null }),
  openConfirmation: (options) => 
    set({ confirmation: options }),
  closeConfirmation: () => 
    set({ confirmation: null }),
}));


// Hook to use with the confirmation dialog provider
export const useConfirmation = () => {
    const { confirmation, openConfirmation, closeConfirmation } = useAdminStore();
    return {
        confirmationOptions: confirmation,
        isConfirmationOpen: !!confirmation,
        showConfirmation: openConfirmation,
        hideConfirmation: closeConfirmation,
    };
};
