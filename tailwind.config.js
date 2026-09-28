/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", "./public/**/*.html", "./*.html"],
  theme: {
    extend: {
      colors: {
        // Brand tokens
        "brand-bg": "#f9fafb",
        "brand-text": "#0f2c49",
        "brand-muted": "rgba(15, 44, 73, 0.65)",
        "brand-orange": {
          DEFAULT: "#eb5c33",
          dark: "#d14a24",   // hover/active state
          light: "#f7ded4",  // tints / soft badges
        },
        "brand-navy": {
          DEFAULT: "#0f2c49",
          light: "#1c3f66",  // secondary navy surfaces / borders
          soft: "#eef1f5",   // very light neutral section background
        },
        brand:'#168BC5', 
        deep:'#0B3558', 
        leaf:'#43B63F', 
        ink:'#0F1720', 
        body:'#334155', 
        mist:'#F5F9FC'
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", 'Manrope', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,44,73,0.06), 0 8px 24px -12px rgba(15,44,73,0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};