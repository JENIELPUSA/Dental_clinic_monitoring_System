/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            screens: {
                "2xs": "320px",
                xs: "360px",
                "xs-max": "430px",
                xm: "640px",
                md: "768px",
                lg: "1024px",
                xl: "1280px",
                "2xl": "1536px",
                phone1080: "1080px",
            },
        },
    },
    plugins: [],
};
