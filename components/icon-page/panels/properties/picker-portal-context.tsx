'use client';

import { createContext, useContext } from 'react';


export const PickerPortalContext = createContext<HTMLDivElement | null>(null);

export function usePickerPortal(): HTMLDivElement | null {
  return useContext(PickerPortalContext);
}
