/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'prod-normal': ['Prod-Normal', 'sans-serif'],
        'prod-italic': ['Prod-Italic', 'sans-serif'],
        'prod-thin': ['Prod-Thin', 'sans-serif'],
        'prod-light': ['Prod-Light', 'sans-serif'],
        'prod-medium': ['Prod-Medium', 'sans-serif'],
        'prod-black-regular': ['Prod-Black-Regular', 'sans-serif'],
        'prod-thin-italic': ['Prod-Thin-Italic', 'sans-serif'],
        'prod-light-italic': ['Prod-Light-Italic', 'sans-serif'],
        'prod-medium-italic': ['Prod-Medium-Italic', 'sans-serif'],
        'prod-bold': ['Prod-bold', 'sans-serif'],
        'prod-bold-italic': ['Prod-Bold-Italic', 'sans-serif'],
        'prod-black-italic': ['Prod-Black-Italic', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
