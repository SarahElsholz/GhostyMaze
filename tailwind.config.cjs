/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',],
  theme: {
    extend: {
      colors: {
			transparent: 'transparent',
			current: 'currentColor',
		  'forestgreen': ' #4f463c',
			'darkblue': '#091421',
			'middleblue': '#284d5d',
			'brightred': '#bd0113',
			'blackbrown': '#22211B',
			'darkred':'#5d0112',
			'dirtbrown': '#4f463c',
		  },
    },
  },

  darkMode: 'class',
}
