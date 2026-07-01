// --------------------------------
// Localization
// --------------------------------

let translations = {};

// default is English
let currentLanguage = localStorage.getItem('language') || 'en';

function GetNestedTranslation(obj, path)
{
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function LoadLanguage(language)
{
    translations = locales[language];

    currentLanguage = language;
    localStorage.setItem('language', language);
    document.documentElement.lang = language;

    TranslatePage();

    window.dispatchEvent(new Event('languageChanged'));
}

function TranslatePage()
{
    const elements = document.querySelectorAll('[data-l10n]');

    elements.forEach(element => {
        const key = element.getAttribute('data-l10n');
        const translatedText = GetNestedTranslation(translations, key);

        if( translatedText )
        {
            element.innerHTML = translatedText;
        }
    });
}

function ChangeLanguage(language)
{
    if( language != currentLanguage )
    {
        LoadLanguage(language);
    }
}

document.addEventListener('DOMContentLoaded', () => { LoadLanguage(currentLanguage); });