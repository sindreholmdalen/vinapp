const _defaultTheme = require('tailwindcss/defaultTheme');
const defaultTheme = _defaultTheme.default || _defaultTheme;
const _forms = require('@tailwindcss/forms');
const forms = _forms.default || _forms;

module.exports = {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                wine: {
                    50: '#fdf2f4',
                    100: '#fce7eb',
                    200: '#f9d0d9',
                    300: '#f4a9b8',
                    400: '#ed7693',
                    500: '#e04870',
                    600: '#cc285a',
                    700: '#ab1d4a',
                    800: '#8f1b42',
                    900: '#7a1b3d',
                    950: '#44091e',
                },
            },
        },
    },
    plugins: [forms],
};
