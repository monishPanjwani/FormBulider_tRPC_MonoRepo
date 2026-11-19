import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { FormState, Theme } from './types';

export const useFormStore = create<FormState>((set) => ({
  elements: [],
  theme: 'auto',
  visibility: 'unlisted',
  allowedEmails: [],
  backgroundUrl: null,
  customAppBg: null,
  customCanvasBg: null,
  customTextColor: null,
  companyName: null,
  setCompanyName: (companyName) => set({ companyName }),
  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),
  loadTemplate: (elements) => set({ elements }),
  setFormStyle: (style) => set({ ...style }),
  updateElementPosition: (id, x, y) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el
      ),
    })),
  updateElementProps: (id, props) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, props: { ...el.props, ...props } } : el
      ),
    })),
  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
    })),
  reorderElements: (oldIndex, newIndex) =>
    set((state) => ({
      elements: arrayMove(state.elements, oldIndex, newIndex),
    })),
  setTheme: (theme: Theme) => set({ theme }),
  setVisibility: (visibility) => set({ visibility }),
  setAllowedEmails: (allowedEmails) => set({ allowedEmails }),
  setBackgroundUrl: (url) => set({ backgroundUrl: url }),
}));
