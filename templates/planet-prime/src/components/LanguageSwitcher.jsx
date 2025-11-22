import { useTranslation } from 'react-i18next'
import { getSupportedLanguages } from '../shared/utils/i18n/languageDetector'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
	const { i18n } = useTranslation()
	const languages = getSupportedLanguages(['en', 'es'])

	const handleLanguageChange = (e) => {
		const newLanguage = e.target.value
		i18n.changeLanguage(newLanguage)
	}

	return (
		<div className="language-switcher">
			<select
				value={i18n.language}
				onChange={handleLanguageChange}
				className="language-select"
				aria-label="Select language"
			>
				{languages.map((lang) => (
					<option key={lang.code} value={lang.code}>
						{lang.flag} {lang.label}
					</option>
				))}
			</select>
		</div>
	)
}

export default LanguageSwitcher
