import { useMemo, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAppTheme } from "./theme/theme";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const [mode, setMode] = useState(localStorage.getItem("themeMode") || "light");
  const theme = useMemo(() => getAppTheme(mode), [mode]);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", next);
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Layout mode={mode} onToggleMode={toggleMode}>
            <AppRoutes />
          </Layout>
          <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
