module.exports = {
  purge: ['./src/renderer/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      translate: ['group-hover'],
      width: ['hover'],
    },
  },
  plugins: [],
}
