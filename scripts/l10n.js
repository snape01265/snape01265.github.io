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

async function LoadLanguage(lang)
{
    try
    {
        const response = await fetch(`locales/${lang}.json`);
        translations = await response.json();

        currentLanguage = lang;
        localStorage.setItem('language', lang);

        TranslatePage();

        window.dispatchEvent(new Event('languageChanged'));
    }
    catch( error )
    {
        console.error("Failed to load language:", error);
    }
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