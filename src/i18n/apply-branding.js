/**
 * Apply Ferdi branding to i18n translations
 */
const fs = require('fs-extra');
const path = require('path');

console.log('Applying Ferdi branding to translations...');

// Keys to ignore when applying branding
const ignore = [
    'login.customServerSuggestion'
]

// Files to ignore when applying branding
const ignoreFiles = [
    'defaultMessages.json',
    '.DS_Store',
    '.',
    '..'
]

// What to replace
const replace = {
    'franz': 'Ferdi',
    'meetfranz.com': 'getferdi.com'
}


const locales = path.join(__dirname, 'locales');
const files = fs.readdirSync(locales)

const replaceFind = Object.keys(replace);
const replaceReplaceWith = Object.values(replace);

const replaceStr = (str, find, replace) => {
    for (var i = 0; i < find.length; i++) {
        str = str.replace(new RegExp(find[i], 'gi'), replace[i]);
    }
    return str;
}

files.forEach(async file => {
    if (ignoreFiles.includes(file)) return;

    // Read locale data
    const filePath = path.join(locales, file);
    let locale = await fs.readJson(filePath);

    // Replace branding
    for (const key in locale) {
        if (ignore.includes(key)) return;

        locale[key] = replaceStr(locale[key], replaceFind, replaceReplaceWith);
    }

    await fs.writeJson(filePath, locale, {
        spaces: 2,
        EOL: '\n',
    });
})