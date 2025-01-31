import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#60a5fa", // Lighter blue for dark mode
      light: "#93c5fd",
      dark: "#3b82f6",
    },
    secondary: {
      main: "#f472b6", // Lighter pink for dark mode
      light: "#f9a8d4",
      dark: "#ec4899",
    },
    background: {
      default: "#0f172a", // Dark blue background
      paper: "#1e293b", // Slightly lighter blue for cards
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
    divider: "rgba(148, 163, 184, 0.12)",
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: "#f1f5f9",
    },
    h6: {
      fontWeight: 600,
      color: "#f1f5f9",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: "2rem",
          paddingBottom: "2rem",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)",
          borderRadius: 12,
          border: "1px solid rgba(148, 163, 184, 0.1)",
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
            "& fieldset": {
              borderColor: "rgba(148, 163, 184, 0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(148, 163, 184, 0.3)",
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
