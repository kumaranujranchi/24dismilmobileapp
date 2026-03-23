/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#e84118',
        'primary-dark': '#c73410',
        'primary-light': '#ff6b4a',
        secondary: '#f5a623',
        dark: '#1a1a2e',
        'dark-2': '#16213e',
        text: '#2d2d2d',
        'text-muted': '#6b7280',
        'text-light': '#9ca3af',
        bg: '#f7f8fa',
        'bg-white': '#ffffff',
        border: '#e5e7eb',
        'border-light': '#f3f4f6',
        success: '#10b981',
        warning: '#f59e0b',
      },
      fontFamily: {
        'inter': ['Inter-Regular'],
        'inter-bold': ['Inter-Bold'],
        'inter-medium': ['Inter-Medium'],
        'poppins': ['Poppins-Regular'],
        'poppins-bold': ['Poppins-Bold'],
        'poppins-medium': ['Poppins-Medium'],
        'poppins-semibold': ['Poppins-SemiBold'],
      },
      borderRadius: {
        'base': '12px',
        'sm-custom': '8px',
        'lg-custom': '20px',
      },
      boxShadow: {
        'standard': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
