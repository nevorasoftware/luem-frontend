/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        luem: {
          night: '#0B1220', // Azul noche
          primary: '#1769AA', // Azul corporativo
          accent: '#299BEB', // Azul eléctrico acento
          silver: '#C7D0DA', // Plata
          bg: '#F4F6F8', // Gris claro para fondos
        },
        luxem: {
          night: '#0B1220', // Azul noche
          primary: '#1769AA', // Azul corporativo
          accent: '#299BEB', // Azul eléctrico acento
          silver: '#C7D0DA', // Plata
          bg: '#F4F6F8', // Gris claro para fondos
        },
      },
    },
  },
  plugins: [],
};
