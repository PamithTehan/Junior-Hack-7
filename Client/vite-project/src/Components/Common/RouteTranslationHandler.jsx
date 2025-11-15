import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { translateService } from '../../Utils/translateService';

/**
 * Component to handle translation on route changes
 * This ensures content is translated when navigating between pages
 */
const RouteTranslationHandler = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle translation when route changes
    // Small delay to allow React to render new content
    const timer = setTimeout(() => {
      if (translateService.isInitialized && translateService.currentLanguage !== 'en') {
        // Re-trigger translation for new page content
        const currentLang = translateService.currentLanguage;
        const langKey = Object.keys(translateService.langMap).find(
          key => translateService.langMap[key] === currentLang
        ) || 'en';
        
        // Force re-translation by temporarily resetting
        translateService.currentLanguage = 'en';
        translateService.translatePage(langKey, false);
      }
    }, 400); // Delay to allow content to render

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default RouteTranslationHandler;

