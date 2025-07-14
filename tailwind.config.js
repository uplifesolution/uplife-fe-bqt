/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');
const primeui = require('tailwindcss-primeui');

module.exports = {
  darkMode: ['selector', '[class="p-dark"]'],
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      screens: {
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        '2xl': '1920px'
      }
    }
  },
  plugins: [
    primeui,
    plugin(function ({ addUtilities }) {
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      const colorNames = [
        'primary',
        'secondary',
        'thirdary',
        'success',
        'warning',
        'danger',
        'default'
      ];
      const newUtilities = {};

      colorNames.forEach(color => {
        // Mặc định shade 500 (ví dụ: .text-primary → --p-primary-500)
        newUtilities[`.text-${color}`] = {
          color: `var(--p-${color}-500)`
        };
        newUtilities[`.bg-${color}`] = {
          backgroundColor: `var(--p-${color}-500)`
        };
        newUtilities[`.border-${color}`] = {
          borderColor: `var(--p-${color}-500)`
        };

        // Các shade rõ ràng như .text-primary-100
        shades.forEach(shade => {
          newUtilities[`.text-${color}-${shade}`] = {
            color: `var(--p-${color}-${shade})`
          };
          newUtilities[`.bg-${color}-${shade}`] = {
            backgroundColor: `var(--p-${color}-${shade})`
          };
          newUtilities[`.border-${color}-${shade}`] = {
            borderColor: `var(--p-${color}-${shade})`
          };
        });
      });

      addUtilities(newUtilities);
    })
  ]
};
