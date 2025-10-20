/**
 * Simple i18n (Internationalization) System
 * Handles language switching via URL parameter (?lang=es)
 * Defaults to English if no language is specified
 */

class i18n {
  constructor() {
    this.currentLang = 'en';
    this.translations = {};
    this.supportedLanguages = ['en', 'es'];
  }

  /**
   * Initialize the i18n system
   * Detects language from URL parameter (?lang=es)
   * Falls back to browser language or English
   */
  async init() {
    // Get language from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');

    if (langParam && this.supportedLanguages.includes(langParam)) {
      this.currentLang = langParam;
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (this.supportedLanguages.includes(browserLang)) {
        this.currentLang = browserLang;
      }
    }

    // Load translations
    await this.loadTranslations(this.currentLang);
  }

  /**
   * Load translation file for a specific language
   * @param {string} lang - Language code (e.g., 'en', 'es')
   */
  async loadTranslations(lang) {
    try {
      const response = await fetch(`./lang/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`);
      }
      this.translations = await response.json();
      console.log(`[i18n] Loaded ${lang} translations:`, Object.keys(this.translations).length, 'keys');
    } catch (error) {
      console.error('[i18n] Error loading translations:', error);
      // Fallback to English if loading fails
      if (lang !== 'en') {
        await this.loadTranslations('en');
      }
    }
  }

  /**
   * Get a translation string
   * @param {string} key - Translation key using dot notation (e.g., 'form.step0.title')
   * @param {*} defaultValue - Default value if key is not found
   * @returns {string} Translated string or default value
   */
  t(key, defaultValue = key) {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return typeof value === 'string' ? value : defaultValue;
  }

  /**
   * Change language dynamically
   * @param {string} lang - Language code
   * @param {boolean} reload - Whether to reload the page
   */
  async setLanguage(lang, reload = true) {
    if (!this.supportedLanguages.includes(lang)) {
      console.error(`Language ${lang} is not supported`);
      return;
    }

    await this.loadTranslations(lang);
    this.currentLang = lang;

    if (reload) {
      // Update URL with language parameter
      const url = new URL(window.location);
      url.searchParams.set('lang', lang);
      window.history.pushState({}, '', url);
      location.reload();
    }
  }

  /**
   * Get current language
   * @returns {string} Current language code
   */
  getLang() {
    return this.currentLang;
  }

  /**
   * Translate all elements with data-i18n attribute
   * Usage: <h1 data-i18n="hero.title">Eternus</h1>
   * Or with fallback text: <span data-i18n="form.step0.label">Bride's Name</span>
   */
  translateDOM() {
    console.log(`[i18n] Starting DOM translation for language: ${this.currentLang}`);

    const elements = document.querySelectorAll('[data-i18n]');
    console.log(`[i18n] Found ${elements.length} elements with data-i18n`);

    elements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);

      // Check if element has innerHTML (for HTML content) or just text
      if (el.innerHTML.includes('<') || translation.includes('<')) {
        el.innerHTML = translation;
      } else {
        el.textContent = translation;
      }
    });

    // Handle placeholders
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    console.log(`[i18n] Found ${placeholderElements.length} elements with data-i18n-placeholder`);

    placeholderElements.forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      el.placeholder = translation;
    });

    // Handle aria-labels and titles
    const ariaElements = document.querySelectorAll('[data-i18n-aria]');
    console.log(`[i18n] Found ${ariaElements.length} elements with data-i18n-aria`);

    ariaElements.forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      const translation = this.t(key);
      el.setAttribute('aria-label', translation);
    });

    console.log(`[i18n] DOM translation complete`);
  }
}

// Create global instance
const i18nInstance = new i18n();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    i18nInstance.init().then(() => {
      // Multiple re-translations to ensure framework animations don't overwrite
      setTimeout(() => i18nInstance.translateDOM(), 50);
      setTimeout(() => i18nInstance.translateDOM(), 200);
      setTimeout(() => i18nInstance.translateDOM(), 500);
      setTimeout(() => i18nInstance.translateDOM(), 1000);
      setTimeout(() => i18nInstance.translateDOM(), 2000);
    });
  });
} else {
  i18nInstance.init().then(() => {
    // Multiple re-translations to ensure framework animations don't overwrite
    setTimeout(() => i18nInstance.translateDOM(), 50);
    setTimeout(() => i18nInstance.translateDOM(), 200);
    setTimeout(() => i18nInstance.translateDOM(), 500);
    setTimeout(() => i18nInstance.translateDOM(), 1000);
    setTimeout(() => i18nInstance.translateDOM(), 2000);
  });
}

// Also observe for dynamic content changes and re-translate
if (typeof MutationObserver !== 'undefined') {
  // Create a mutation observer to watch for new elements being added
  const observer = new MutationObserver((mutations) => {
    // Check if any mutations added new elements with data-i18n
    let hasI18nElements = false;
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && (node.getAttribute && node.getAttribute('data-i18n'))) {
            hasI18nElements = true;
          }
          if (node.nodeType === 1 && node.querySelectorAll) {
            if (node.querySelectorAll('[data-i18n]').length > 0) {
              hasI18nElements = true;
            }
          }
        });
      }
    });
    if (hasI18nElements) {
      i18nInstance.translateDOM();
    }
  });

  // Start observing after DOM is ready
  setTimeout(() => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }, 1000);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
