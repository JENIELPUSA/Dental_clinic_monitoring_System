import { createContext, useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "@/contexts/AuthContext"; // adjust path as needed

const initialState = {
    theme: "system",
    setTheme: () => null,
};

export const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "system",
    fallbackStorageKey = "vite-ui-theme",
    ...props
}) {
    const auth = useContext(AuthContext);
    const userId = auth?.userId;
    const storageKey = userId ? `theme-${userId}` : fallbackStorageKey;

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem(storageKey) || defaultTheme;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    const value = {
        theme,
        setTheme: (newTheme) => {
            localStorage.setItem(storageKey, newTheme);
            setTheme(newTheme);
        },
    };

    return (
        <ThemeProviderContext.Provider value={value} {...props}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

ThemeProvider.propTypes = {
    children: PropTypes.node,
    defaultTheme: PropTypes.string,
    fallbackStorageKey: PropTypes.string,
};
