import { createContext, useContext, useState } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";

const ThemeContext = createContext();

export function CustomThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: isDarkMode ? "#60a5fa" : "#2563eb",
        light: isDarkMode ? "#93c5fd" : "#60a5fa",
        dark: isDarkMode ? "#3b82f6" : "#1d4ed8",
      },
      secondary: {
        main: isDarkMode ? "#f472b6" : "#db2777",
        light: isDarkMode ? "#f9a8d4" : "#ec4899",
        dark: isDarkMode ? "#ec4899" : "#be185d",
      },
      background: {
        default: isDarkMode ? "#0f172a" : "#f8fafc",
        paper: isDarkMode ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: isDarkMode ? "#f1f5f9" : "#1e293b",
        secondary: isDarkMode ? "#94a3b8" : "#64748b",
      },
      divider: isDarkMode ? "rgba(148, 163, 184, 0.12)" : "rgba(0, 0, 0, 0.12)",
    },
    typography: {
      h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: isDarkMode
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)"
              : "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
            borderRadius: 12,
            border: `1px solid ${
              isDarkMode ? "rgba(148, 163, 184, 0.1)" : "rgba(0, 0, 0, 0.05)"
            }`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 8,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
