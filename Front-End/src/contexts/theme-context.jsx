import { createContext, useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "@/contexts/AuthContext"; // adjust path as needed

const initialState = {
    theme: "light",
    setTheme: () => null,
};

export const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "light", // default light mode
    fallbackStorageKey = "vite-ui-theme",
    ...props
}) {
    const auth = useContext(AuthContext);
    const userId = auth?.userId;
    const storageKey = userId ? `theme-${userId}` : fallbackStorageKey;

    const [theme, setTheme] = useState(() => {
        // kunin muna sa localStorage kung meron
        const storedTheme = localStorage.getItem(storageKey);
        if (storedTheme) return storedTheme;
        // default light mode kapag walang naka-store
        return defaultTheme;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // tanggalin lahat ng theme classes
        root.classList.remove("light", "dark");

        if (theme === "system") {
            // kunin OS preference
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
