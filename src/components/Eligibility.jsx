import { useMemo, useState } from "react";
import { Alert, Chip, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString()}`;

const Eligibility = () => {
  const [input, setInput] = useState({
    income: "",
    loanAmount: "",
  });

  const result = useMemo(() => {
    const income = Number(input.income);
    const loanAmount = Number(input.loanAmount);

    if (income <= 0 || loanAmount <= 0) return null;

    const maxLoanAllowed = income * 36;
    const ratio = loanAmount / Math.max(income * 12, 1);
    const ratioScore = Math.max(0, 100 - ratio * 100);
    const incomeScore = Math.min(100, (income / 200000) * 100);
    const score = Number((ratioScore * 0.7 + incomeScore * 0.3).toFixed(2));
    const eligible = loanAmount <= maxLoanAllowed && score >= 45;

    return {
      eligible,
      score,
      maxLoanAllowed: Number(maxLoanAllowed.toFixed(2)),
    };
  }, [input]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: 1, borderColor: "divider" }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <VerifiedRoundedIcon color="secondary" />
          <Typography variant="h4">Eligibility Check</Typography>
        </Stack>
        <Typography color="text.secondary">
          Check your borrowing capacity instantly based on income and requested loan amount.
        </Typography>

        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Monthly Income"
              name="income"
              type="number"
              value={input.income}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Loan Amount"
              name="loanAmount"
              type="number"
              value={input.loanAmount}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {result ? (
          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={result.eligible ? "Eligible" : "Not Eligible"}
                color={result.eligible ? "success" : "warning"}
              />
              <Typography color="text.secondary">Score: {result.score}</Typography>
            </Stack>
            <Alert severity={result.eligible ? "success" : "warning"}>
              Max loan amount allowed: {formatCurrency(result.maxLoanAllowed)}
            </Alert>
          </Stack>
        ) : (
          <Alert severity="info">Enter income and loan amount to check eligibility.</Alert>
        )}
      </Stack>
    </Paper>
  );
};

export default Eligibility;
