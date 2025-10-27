/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            screens: {
                '2xs': '320px',
                'xs': '360px',
                'xs-max': '430px',
                'xm': '640px',
            },
        }, 
    }, 
    plugins: [],
};