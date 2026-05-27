/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tomato-pink': '#FFE5E5',
        'clock-purple': '#EEEBFF',
        'music-purple': '#F3E8FF',
        'todo-green': '#DCFCE7',
        'water-blue': '#DBEAFE',
        'notes-purple': '#EDE9FE',
        'ppt-yellow': '#FEF9C3',
        'links-pink': '#FFE4E6',
      }
    },
  },
  plugins: [],
}