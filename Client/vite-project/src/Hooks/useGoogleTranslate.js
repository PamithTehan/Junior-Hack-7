import { useEffect, useRef } from 'react';
import { translateService } from '../Utils/translateService';

/**
 * Hook to manage Google Translate functionality
 * Optimized for whole site translation with route change support
 * @param {string} targetLanguage - Language code (en, si, ta)
 */
export const useGoogleTranslate = (targetLanguage) => {
  const previousLangRef = useRef(targetLanguage);

  useEffect(() => {
    // Initialize translate service
    translateService.initialize().catch((error) => {
      console.warn('Google Translate initialization warning:', error);
    });

    // Translate when language changes
    if (previousLangRef.current !== targetLanguage) {
      previousLangRef.current = targetLanguage;
      translateService.translatePage(targetLanguage);
    }

    // Cleanup on unmount
    return () => {
      // Don't cleanup the service as it's a singleton used across the app
    };
  }, [targetLanguage]);

  return { translateInitialized: translateService.isInitialized };
};

