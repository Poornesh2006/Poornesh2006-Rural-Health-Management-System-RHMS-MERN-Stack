export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9f0",
          100: "#d6efda",
          500: "#2E7D32",
          600: "#25692a",
          700: "#1f5622",
        },
        accent: "#00ACC1",
        surface: "#f5f7fa",
        ink: "#163021",
      },
      boxShadow: {
        panel: "0 18px 60px rgba(23, 43, 33, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(67,160,71,0.18), transparent 28%), radial-gradient(circle at top right, rgba(0,172,193,0.14), transparent 24%)",
      },
    },
  },
  plugins: [],
};
