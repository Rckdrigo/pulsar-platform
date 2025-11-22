/**
 * Language Detection Utility
 *
 * Detects and manages user language preferences across the application.
 * This utility provides a standardized way to detect OS/browser language,
 * persist user preferences, and provide fallback mechanisms.
 *
 * Priority order:
 * 1. User's saved preference (localStorage)
 * 2. Browser/OS language setting (navigator.language)
 * 3. Default language (English)
 *
 * @module languageDetector
 */

/**
 * Default configuration for language detection
 */
const DEFAULT_CONFIG = {
	supportedLanguages: ['en', 'es'],
	defaultLanguage: 'en',
	storageKey: 'app-language',
	storageType: 'localStorage' // 'localStorage' or 'sessionStorage'
}

/**
 * Detects the browser/OS language
 *
 * @returns {string} The detected language code (e.g., 'en', 'es')
 */
export const detectBrowserLanguage = () => {
	try {
		// Try navigator.language first (most reliable)
		const navLang = navigator.language || navigator.userLanguage

		if (navLang) {
			// Extract language code (e.g., 'es' from 'es-MX' or 'es-ES')
			const langCode = navLang.split('-')[0].toLowerCase()
			return langCode
		}

		// Fallback: try navigator.languages array
		if (navigator.languages && navigator.languages.length > 0) {
			const firstLang = navigator.languages[0].split('-')[0].toLowerCase()
			return firstLang
		}

		return null
	} catch (error) {
		console.warn('Error detecting browser language:', error)
		return null
	}
}

/**
 * Gets the language preference from storage
 *
 * @param {string} storageKey - The key used to store the language preference
 * @param {string} storageType - The storage type ('localStorage' or 'sessionStorage')
 * @returns {string|null} The stored language code or null if not found
 */
export const getStoredLanguage = (
	storageKey = DEFAULT_CONFIG.storageKey,
	storageType = DEFAULT_CONFIG.storageType
) => {
	try {
		const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage
		const stored = storage.getItem(storageKey)
		return stored
	} catch (error) {
		console.warn('Error reading language from storage:', error)
		return null
	}
}

/**
 * Saves the language preference to storage
 *
 * @param {string} language - The language code to save
 * @param {string} storageKey - The key used to store the language preference
 * @param {string} storageType - The storage type ('localStorage' or 'sessionStorage')
 * @returns {boolean} True if saved successfully, false otherwise
 */
export const saveLanguage = (
	language,
	storageKey = DEFAULT_CONFIG.storageKey,
	storageType = DEFAULT_CONFIG.storageType
) => {
	try {
		const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage
		storage.setItem(storageKey, language)
		return true
	} catch (error) {
		console.warn('Error saving language to storage:', error)
		return false
	}
}

/**
 * Detects the initial language based on user preferences and browser settings
 *
 * @param {Object} config - Configuration object
 * @param {string[]} config.supportedLanguages - Array of supported language codes
 * @param {string} config.defaultLanguage - Default language to use as fallback
 * @param {string} config.storageKey - localStorage key for language preference
 * @param {string} config.storageType - Storage type ('localStorage' or 'sessionStorage')
 * @returns {string} The detected language code
 */
export const getInitialLanguage = (config = {}) => {
	const {
		supportedLanguages = DEFAULT_CONFIG.supportedLanguages,
		defaultLanguage = DEFAULT_CONFIG.defaultLanguage,
		storageKey = DEFAULT_CONFIG.storageKey,
		storageType = DEFAULT_CONFIG.storageType
	} = config

	// 1. Check localStorage for saved preference
	const savedLanguage = getStoredLanguage(storageKey, storageType)
	if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
		return savedLanguage
	}

	// 2. Check browser/OS language
	const browserLang = detectBrowserLanguage()
	if (browserLang && supportedLanguages.includes(browserLang)) {
		// Auto-save detected language for future visits
		saveLanguage(browserLang, storageKey, storageType)
		return browserLang
	}

	// 3. Default language
	return defaultLanguage
}

/**
 * Gets all available languages with their display names
 *
 * @returns {Object[]} Array of language objects with code, label, and flag
 */
export const getSupportedLanguages = (supportedLanguages = DEFAULT_CONFIG.supportedLanguages) => {
	const allLanguages = [
		{ code: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English' },
		{ code: 'es', label: 'Español', flag: '🇲🇽', nativeName: 'Español' }
	]
	return allLanguages.filter((lang) => supportedLanguages.includes(lang.code))
}

export default {
	detectBrowserLanguage,
	getStoredLanguage,
	saveLanguage,
	getInitialLanguage,
	getSupportedLanguages,
	DEFAULT_CONFIG
}
