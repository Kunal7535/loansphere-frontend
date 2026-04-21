import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ThemeModeToggle from "./ThemeModeToggle";
import { useAuth } from "../hooks/useAuth";

const navButtonStyle = {
  borderRadius: 20,
  px: 2,
};

const Layout = ({ children, mode, onToggleMode }) => {
  const { isAuthenticated, admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          mode === "light"
            ? "linear-gradient(150deg, rgba(6,120,199,0.09), rgba(19,170,130,0.09) 40%, rgba(255,255,255,0.8) 90%)"
            : "radial-gradient(circle at top left, rgba(57,132,255,0.17), transparent 40%), radial-gradient(circle at bottom right, rgba(47,214,165,0.14), transparent 45%), #07121f",
      }}
    >
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ py: 1 }}>
          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{ textDecoration: "none", color: "text.primary", flexGrow: 1, fontFamily: "'Poppins', sans-serif" }}
          >
            LoanSphere Loans
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button component={RouterLink} to="/" color="inherit" sx={navButtonStyle}>
              Home
            </Button>
            {isAuthenticated ? (
              <>
                <Button component={RouterLink} to="/admin/dashboard" color="inherit" sx={navButtonStyle}>
                  Dashboard
                </Button>
                <Button onClick={handleLogout} variant="contained" color="secondary" sx={navButtonStyle}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button component={RouterLink} to="/admin/login" variant="contained" sx={navButtonStyle}>
                  Admin
                </Button>
              </>
            )}
            <ThemeModeToggle mode={mode} onToggle={onToggleMode} />
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {isAuthenticated && admin?.email ? (
          <Typography sx={{ mb: 2 }} color="text.secondary">
            Signed in as {admin.email}
          </Typography>
        ) : null}
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
