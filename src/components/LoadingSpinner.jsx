import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingSpinner = ({ label = "Loading..." }) => {
  return (
    <Box sx={{ py: 8, display: "grid", placeItems: "center", gap: 2 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
