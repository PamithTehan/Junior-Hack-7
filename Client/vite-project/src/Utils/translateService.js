/**
 * Google Translate Service
 * Singleton service to manage Google Translate across the entire application
 * Handles route changes, dynamic content, and optimizes translation performance
 */

class TranslateService {
  constructor() {
    this.isInitialized = false;
    this.currentLanguage = 'en';
    this.initPromise = null;
    this.translateElement = null;
    this.retryCount = 0;
    this.maxRetries = 50;
    this.translationTimeout = null;
    this.routeChangeHandler = null;
    this.mutationObserver = null;
    
    // Language mapping
    this.langMap = {
      'en': 'en',
      'si': 'si', // Sinhala
      'ta': 'ta'  // Tamil
    };
  }

  /**
   * Initialize Google Translate
   */
  async initialize() {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const checkGoogleTranslate = () => {
        if (typeof window.google !== 'undefined' && 
            window.google.translate && 
            window.google.translate.TranslateElement) {
          
          // Get the translate element
          const element = document.getElementById('google_translate_element');
          if (element && !this.translateElement) {
            try {
              // Initialize translate element if not already done
              if (!element.hasChildNodes()) {
                new window.google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,si,ta',
                  layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false
                }, 'google_translate_element');
              }
              
              this.translateElement = element;
              this.isInitialized = true;
              this.retryCount = 0;
              
              // Hide the banner immediately
              this.hideBanner();
              
              // Get saved language and apply it
              const savedLang = localStorage.getItem('language') || 'en';
              if (savedLang !== 'en') {
                this.translatePage(savedLang, false);
              }
              
              resolve();
            } catch (error) {
              console.error('Error initializing Google Translate:', error);
              reject(error);
            }
          } else if (element) {
            this.translateElement = element;
            this.isInitialized = true;
            this.hideBanner();
            resolve();
          } else {
            this.retryCount++;
            if (this.retryCount < this.maxRetries) {
              setTimeout(checkGoogleTranslate, 100);
            } else {
              reject(new Error('Google Translate element not found'));
            }
          }
        } else {
          this.retryCount++;
          if (this.retryCount < this.maxRetries) {
            setTimeout(checkGoogleTranslate, 100);
          } else {
            reject(new Error('Google Translate API not loaded'));
          }
        }
      };

      // Start checking after a short delay
      setTimeout(checkGoogleTranslate, 100);
    });

    return this.initPromise;
  }

  /**
   * Hide Google Translate banner
   */
  hideBanner() {
    const banner = document.querySelector('.goog-te-banner-frame');
    if (banner) {
      banner.style.display = 'none';
      banner.style.visibility = 'hidden';
      banner.style.height = '0';
      banner.style.width = '0';
    }
    
    // Also hide the top bar that Google Translate adds
    const topBar = document.querySelector('.goog-te-banner-frame.skiptranslate');
    if (topBar) {
      topBar.style.display = 'none';
    }
    
    // Prevent body top margin
    const body = document.body;
    if (body) {
      body.style.top = '0 !important';
    }
  }

  /**
   * Get the Google Translate select element
   */
  getSelectElement() {
    return document.querySelector('.goog-te-combo');
  }

  /**
   * Translate the entire page
   * @param {string} targetLanguage - Language code (en, si, ta)
   * @param {boolean} debounce - Whether to debounce the translation
   */
  translatePage(targetLanguage, debounce = true) {
    const googleLangCode = this.langMap[targetLanguage] || 'en';
    
    // Clear any pending translations
    if (this.translationTimeout) {
      clearTimeout(this.translationTimeout);
    }

    const performTranslation = () => {
      if (!this.isInitialized) {
        this.initialize().then(() => {
          this.translatePage(targetLanguage, false);
        }).catch(() => {
          console.warn('Google Translate not initialized, retrying...');
        });
        return;
      }

      // If switching to English, restore original
      if (googleLangCode === 'en') {
        this.restoreOriginal();
        this.currentLanguage = 'en';
        return;
      }

      // Only translate if language changed
      if (this.currentLanguage === googleLangCode) {
        return;
      }

      this.currentLanguage = googleLangCode;

      try {
        const select = this.getSelectElement();
        if (select) {
          if (select.value !== googleLangCode) {
            select.value = googleLangCode;
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            select.dispatchEvent(event);
            
            // Also try input event for better compatibility
            const inputEvent = new Event('input', { bubbles: true });
            select.dispatchEvent(inputEvent);
            
            // Hide banner after translation
            setTimeout(() => {
              this.hideBanner();
            }, 500);
          }
        } else {
          // Retry if select not found
          this.retryCount = 0;
          const retryTranslation = () => {
            const select = this.getSelectElement();
            if (select) {
              select.value = googleLangCode;
              select.dispatchEvent(new Event('change', { bubbles: true }));
              setTimeout(() => {
                this.hideBanner();
              }, 500);
            } else if (this.retryCount < 10) {
              this.retryCount++;
              setTimeout(retryTranslation, 200);
            }
          };
          setTimeout(retryTranslation, 200);
        }
      } catch (error) {
        console.error('Error translating page:', error);
      }
    };

    if (debounce) {
      this.translationTimeout = setTimeout(performTranslation, 100);
    } else {
      performTranslation();
    }
  }

  /**
   * Restore original English content
   */
  restoreOriginal() {
    // Hide banner
    this.hideBanner();

    // Remove translated classes from body
    const body = document.body;
    if (body) {
      body.classList.remove('translated-ltr', 'translated-rtl');
      body.style.top = '0';
    }

    // Reset select dropdown
    const select = this.getSelectElement();
    if (select) {
      select.value = 'en';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Remove Google Translate iframes (except the main one)
    const translateFrames = document.querySelectorAll('iframe[src*="translate.google"]');
    translateFrames.forEach(frame => {
      if (frame.id !== 'google_translate_element' && 
          !frame.closest('.goog-te-banner-frame')) {
        frame.remove();
      }
    });
  }

  /**
   * Handle route changes - re-translate content when navigating
   */
  handleRouteChange() {
    // Small delay to allow React to render new content
    setTimeout(() => {
      if (this.currentLanguage !== 'en') {
        // Re-trigger translation for new page content
        const currentLang = this.currentLanguage;
        this.currentLanguage = 'en'; // Reset to force re-translation
        this.translatePage(
          Object.keys(this.langMap).find(key => this.langMap[key] === currentLang) || 'en',
          false
        );
      }
    }, 300);
  }

  /**
   * Setup route change listener
   */
  setupRouteListener() {
    if (this.routeChangeHandler) {
      return;
    }

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });

    // Override pushState and replaceState to detect route changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleRouteChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleRouteChange();
    };

    // Setup MutationObserver to handle dynamically loaded content
    this.setupMutationObserver();

    this.routeChangeHandler = true;
  }

  /**
   * Setup MutationObserver to detect dynamically added content
   */
  setupMutationObserver() {
    if (this.mutationObserver) {
      return;
    }

    // Debounce function for mutation observer
    let mutationTimeout;
    const debouncedTranslate = () => {
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(() => {
        if (this.currentLanguage !== 'en' && this.isInitialized) {
          // Re-trigger translation for new content
          const langKey = Object.keys(this.langMap).find(
            key => this.langMap[key] === this.currentLanguage
          ) || 'en';
          
          if (langKey !== 'en') {
            const select = this.getSelectElement();
            if (select && select.value === this.currentLanguage) {
              // Force re-translation by briefly changing and changing back
              select.value = 'en';
              setTimeout(() => {
                select.value = this.currentLanguage;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                this.hideBanner();
              }, 50);
            }
          }
        }
      }, 500); // Debounce for 500ms
    };

    // Create observer for dynamically added content
    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldTranslate = false;
      
      mutations.forEach((mutation) => {
        // Check if new nodes were added
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            // Only translate if it's an element node with text content
            if (node.nodeType === 1 && 
                node.textContent && 
                node.textContent.trim().length > 0 &&
                !node.closest('.goog-te-banner-frame') &&
                !node.closest('#google_translate_element')) {
              shouldTranslate = true;
            }
          });
        }
      });

      if (shouldTranslate) {
        debouncedTranslate();
      }
    });

    // Start observing
    if (document.body) {
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: false
      });
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.translationTimeout) {
      clearTimeout(this.translationTimeout);
      this.translationTimeout = null;
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }
}

// Export singleton instance
export const translateService = new TranslateService();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  // Setup route listener
  translateService.setupRouteListener();
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      translateService.initialize().catch(() => {
        // Silent fail - will retry when needed
      });
    });
  } else {
    translateService.initialize().catch(() => {
      // Silent fail - will retry when needed
    });
  }
}

