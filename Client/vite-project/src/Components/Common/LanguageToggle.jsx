import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../Contexts/LanguageContext';
import { FiGlobe } from 'react-icons/fi';

/**
 * LanguageToggle Component
 * Configurable language selector with Google Translate integration
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant: 'default' | 'minimal' | 'icon-only'
 * @param {string} props.size - Button size: 'sm' | 'md' | 'lg'
 * @param {string} props.position - Dropdown position: 'left' | 'right'
 * @param {boolean} props.showFlags - Whether to show flag emojis
 * @param {boolean} props.showNames - Whether to show language names
 */
const LanguageToggle = ({
  variant = 'default',
  size = 'md',
  position = 'right',
  showFlags = true,
  showNames = true,
}) => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'si', name: 'සිංහල', nativeName: 'සිංහල', flag: '🇱🇰' },
    { code: 'ta', name: 'தமிழ்', nativeName: 'தமிழ்', flag: '🇱🇰' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  // Size configurations
  const sizeClasses = {
    sm: {
      button: 'px-2 py-1.5 text-xs',
      flag: 'text-base',
      icon: 'w-3 h-3',
      dropdown: 'w-36',
      item: 'px-3 py-2 text-sm',
    },
    md: {
      button: 'px-3 py-2 text-sm',
      flag: 'text-lg',
      icon: 'w-4 h-4',
      dropdown: 'w-40',
      item: 'px-4 py-3',
    },
    lg: {
      button: 'px-4 py-2.5 text-base',
      flag: 'text-xl',
      icon: 'w-5 h-5',
      dropdown: 'w-44',
      item: 'px-5 py-3.5',
    },
  };

  const sizeConfig = sizeClasses[size] || sizeClasses.md;

  // Variant configurations
  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
    minimal: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700',
    'icon-only': 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-2',
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowDown' && isOpen) {
        event.preventDefault();
        const firstItem = dropdownRef.current?.querySelector('button');
        firstItem?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
    // Translation will be handled by the useGoogleTranslate hook in LanguageContext
  };

  const handleKeyDown = (event, langCode) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLanguageChange(langCode);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const buttons = Array.from(dropdownRef.current?.querySelectorAll('button') || []);
      const currentIndex = buttons.indexOf(event.currentTarget);
      const nextButton = buttons[currentIndex + 1];
      nextButton?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const buttons = Array.from(dropdownRef.current?.querySelectorAll('button') || []);
      const currentIndex = buttons.indexOf(event.currentTarget);
      const prevButton = buttons[currentIndex - 1];
      if (prevButton) {
        prevButton.focus();
      } else {
        buttonRef.current?.focus();
      }
    }
  };

  const positionClass = position === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
            setTimeout(() => {
              const firstItem = dropdownRef.current?.querySelector('button');
              firstItem?.focus();
            }, 0);
          }
        }}
        className={`
          flex items-center space-x-2 rounded-lg font-medium
          transition-all duration-200 focus:outline-none focus:ring-2 
          focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
          ${sizeConfig.button}
          ${variant === 'icon-only' ? sizeConfig.iconOnly || 'p-2' : ''}
          ${variantClasses[variant]}
          ${isOpen ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
        `}
        aria-label={`Change language. Current language: ${currentLanguage.nativeName}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {variant === 'icon-only' ? (
          <FiGlobe className={`${sizeConfig.icon} text-gray-700 dark:text-gray-300`} />
        ) : (
          <>
            {showFlags && (
              <span className={sizeConfig.flag} role="img" aria-hidden="true">
                {currentLanguage.flag}
              </span>
            )}
            {showNames && (
              <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">
                {currentLanguage.nativeName}
              </span>
            )}
            {!showNames && !showFlags && (
              <FiGlobe className={`${sizeConfig.icon} text-gray-700 dark:text-gray-300`} />
            )}
          </>
        )}
        <svg
          className={`${sizeConfig.icon} text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown menu */}
          <div
            className={`
              absolute ${positionClass} mt-2 ${sizeConfig.dropdown}
              bg-white dark:bg-gray-800 rounded-lg shadow-xl
              border border-gray-200 dark:border-gray-700 z-50
              overflow-hidden
            `}
            role="menu"
            aria-orientation="vertical"
            style={{
              animation: 'fadeInDown 0.2s ease-out',
            }}
          >
            {languages.map((lang, index) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                onKeyDown={(e) => handleKeyDown(e, lang.code)}
                role="menuitem"
                tabIndex={0}
                className={`
                  w-full flex items-center space-x-3 ${sizeConfig.item} text-left
                  transition-colors duration-150 focus:outline-none
                  focus:bg-gray-100 dark:focus:bg-gray-700
                  ${
                    language === lang.code
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                aria-current={language === lang.code ? 'true' : 'false'}
              >
                {showFlags && (
                  <span className="text-xl" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                )}
                <span className="font-medium flex-1">{lang.nativeName}</span>
                {language === lang.code && (
                  <svg
                    className={`${sizeConfig.icon} text-primary-600 dark:text-primary-400`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageToggle;
