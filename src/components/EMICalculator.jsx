import { useMemo, useState } from "react";
import { Alert, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString()}`;

const EMICalculator = () => {
  const [inputs, setInputs] = useState({
    loanAmount: "500000",
    interestRate: "12",
    tenureMonths: "24",
  });

  const result = useMemo(() => {
    const principal = Number(inputs.loanAmount);
    const annualRate = Number(inputs.interestRate);
    const tenureMonths = Number(inputs.tenureMonths);

    if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) {
      return null;
    }

    const monthlyRate = annualRate / 12 / 100;
    let monthlyEmi = 0;

    if (monthlyRate === 0) {
      monthlyEmi = principal / tenureMonths;
    } else {
      const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
      const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
      monthlyEmi = numerator / denominator;
    }

    const totalPayable = monthlyEmi * tenureMonths;
    const totalInterest = totalPayable - principal;

    return {
      monthlyEmi: Number(monthlyEmi.toFixed(2)),
      totalPayable: Number(totalPayable.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
    };
  }, [inputs]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: 1, borderColor: "divider" }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CalculateRoundedIcon color="primary" />
          <Typography variant="h4">EMI Calculator</Typography>
        </Stack>
        <Typography color="text.secondary">
          Estimate your monthly repayment instantly using loan amount, interest rate, and tenure.
        </Typography>

        <Grid container spacing={1.5}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Loan Amount"
              name="loanAmount"
              type="number"
              value={inputs.loanAmount}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Interest Rate (%)"
              name="interestRate"
              type="number"
              value={inputs.interestRate}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tenure (months)"
              name="tenureMonths"
              type="number"
              value={inputs.tenureMonths}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {result ? (
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, border: 1, borderColor: "divider" }}>
                <Typography color="text.secondary" variant="body2">
                  Monthly EMI
                </Typography>
                <Typography variant="h6">{formatCurrency(result.monthlyEmi)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, border: 1, borderColor: "divider" }}>
                <Typography color="text.secondary" variant="body2">
                  Total Interest
                </Typography>
                <Typography variant="h6">{formatCurrency(result.totalInterest)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, border: 1, borderColor: "divider" }}>
                <Typography color="text.secondary" variant="body2">
                  Total Payable
                </Typography>
                <Typography variant="h6">{formatCurrency(result.totalPayable)}</Typography>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">Enter valid values to calculate EMI.</Alert>
        )}
      </Stack>
    </Paper>
  );
};

export default EMICalculator;
