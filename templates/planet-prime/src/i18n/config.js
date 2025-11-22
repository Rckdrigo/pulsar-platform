import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getInitialLanguage } from '../shared/utils/i18n/languageDetector'

// Import translations
import enCommon from '../locales/en/common.json'
import esCommon from '../locales/es/common.json'

// Configure i18next
i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources: {
			en: {
				common: enCommon
			},
			es: {
				common: esCommon
			}
		},
		lng: getInitialLanguage({
			supportedLanguages: ['en', 'es'],
			defaultLanguage: 'en',
			storageKey: 'supernova-language'
		}),
		fallbackLng: 'en',
		ns: ['common'],
		defaultNS: 'common',

		interpolation: {
			escapeValue: false // react already safes from xss
		},

		react: {
			useSuspense: false // disable suspense for now
		}
	})

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
	localStorage.setItem('supernova-language', lng)
})

export default i18n
