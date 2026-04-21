import { createTheme } from "@mui/material/styles";

const getPalette = (mode) => {
  const isLight = mode === "light";
  return {
    mode,
    primary: {
      main: isLight ? "#0b6bcb" : "#63b3ff",
    },
    secondary: {
      main: isLight ? "#0f9f7a" : "#2fd6a5",
    },
    background: {
      default: isLight ? "#eff6ff" : "#07121f",
      paper: isLight ? "#ffffff" : "#102033",
    },
    text: {
      primary: isLight ? "#12263a" : "#e8f2ff",
      secondary: isLight ? "#3f5d79" : "#a7c2de",
    },
    divider: isLight ? "#dbe9f7" : "#274460",
  };
};

export const getAppTheme = (mode) =>
  createTheme({
    palette: getPalette(mode),
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily: "'Manrope', sans-serif",
      h1: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "2.3rem", lineHeight: 1.1 },
      h2: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "1.9rem" },
      h3: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "1.45rem" },
      button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(8px)",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
    },
  });
