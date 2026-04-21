import { Avatar, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

const loanTypes = [
  {
    title: "Personal Loan",
    description: "For emergencies, travel, medical bills, and personal expenses with quick approvals.",
    icon: <PersonRoundedIcon />,
  },
  {
    title: "Business Loan",
    description: "Fuel business growth, manage working capital, and expand operations with flexibility.",
    icon: <StorefrontRoundedIcon />,
  },
  {
    title: "Home Loan",
    description: "Get financing for your dream home, renovation, or balance transfer at competitive rates.",
    icon: <HomeWorkRoundedIcon />,
  },
  {
    title: "Education Loan",
    description: "Support tuition, hostel, and education expenses for higher studies in India or abroad.",
    icon: <SchoolRoundedIcon />,
  },
];

const LoanTypes = ({ onApplyNow }) => {
  return (
    <Stack spacing={2}>
      <Typography variant="h3">Loan Types</Typography>
      <Typography color="text.secondary">Choose the right loan category and apply in a few steps.</Typography>
      <Grid container spacing={1.8}>
        {loanTypes.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Paper
              sx={{
                p: 2.2,
                border: 1,
                borderColor: "divider",
                height: "100%",
                transition: "transform 220ms ease, box-shadow 220ms ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 8,
                },
              }}
            >
              <Stack spacing={1.2}>
                <Avatar sx={{ bgcolor: "primary.main", width: 42, height: 42 }}>{item.icon}</Avatar>
                <Typography variant="h6">{item.title}</Typography>
                <Typography color="text.secondary" sx={{ minHeight: 74 }}>
                  {item.description}
                </Typography>
                <Button variant="contained" onClick={onApplyNow}>
                  Apply Now
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default LoanTypes;
