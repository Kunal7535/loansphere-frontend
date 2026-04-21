import { useState } from "react";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await adminLogin(formData);
      toast.success(response.message || "Welcome, admin.");
      navigate("/admin/dashboard");
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to login.");
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 520, mx: "auto", p: { xs: 3, md: 4 }, border: 1, borderColor: "divider" }}>
      <Stack spacing={2.2} component="form" onSubmit={handleSubmit}>
        <Typography variant="h3">Admin Login</Typography>
        <Typography color="text.secondary">Sign in to manage loan lifecycle, decisions, and analytics.</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Admin Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </Button>
      </Stack>
    </Paper>
  );
};

export default AdminLogin;
