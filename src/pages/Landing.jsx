import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../api/axios";
import { applyLoanApi } from "../api/loanApi";
import EMICalculator from "../components/EMICalculator";
import LoanTypes from "../components/LoanTypes";
import Eligibility from "../components/Eligibility";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  income: "",
  loanAmount: "",
  employmentType: "",
};

const supportInitialForm = {
  name: "",
  email: "",
  message: "",
};

const featureCards = [
  {
    title: "Instant Approval",
    description: "Smart underwriting helps us verify applications quickly and reduce turnaround time.",
    icon: <BoltRoundedIcon />,
  },
  {
    title: "Low Interest Rates",
    description: "Transparent pricing with competitive rates tailored to profile and repayment capacity.",
    icon: <PercentRoundedIcon />,
  },
  {
    title: "Secure Process",
    description: "Your data is processed with strong security practices and encrypted transmission.",
    icon: <SecurityRoundedIcon />,
  },
  {
    title: "Fast Disbursement",
    description: "Approved applications are moved to disbursement quickly with end-to-end tracking.",
    icon: <PaymentsRoundedIcon />,
  },
];

const steps = [
  {
    title: "Fill Form",
    description: "Share basic income and loan details through our quick online form.",
  },
  {
    title: "Get Approval",
    description: "Our team evaluates eligibility and verifies the lead for approval.",
  },
  {
    title: "Receive Loan",
    description: "Once approved, disbursement process starts and status is communicated promptly.",
  },
];

const testimonials = [
  {
    name: "Rahul Mehta",
    text: "The form was easy and I got a response within hours. Smooth and transparent process.",
  },
  {
    name: "Neha Sharma",
    text: "I compared options and got a better rate than expected. The team was very helpful.",
  },
  {
    name: "Arjun Singh",
    text: "Fast verification and clear communication from application to approval stage.",
  },
  {
    name: "Priya Verma",
    text: "Clean experience, no confusion, and the EMI estimate helped me plan confidently.",
  },
];

const faqs = [
  {
    question: "What is EMI?",
    answer:
      "EMI stands for Equated Monthly Instalment, the fixed monthly amount you pay towards loan repayment including principal and interest.",
  },
  {
    question: "How long does approval take?",
    answer:
      "Basic lead review usually starts quickly. Final approval can vary based on verification and documentation requirements.",
  },
  {
    question: "What documents are required?",
    answer:
      "Typically identity proof, address proof, income proof, and bank statements are required. The exact list depends on loan type.",
  },
];

const Landing = () => {
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [uiLoading, setUiLoading] = useState(true);
  const [supportForm, setSupportForm] = useState(supportInitialForm);

  const loanFormRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setUiLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);

  const scrollToForm = () => {
    loanFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!formData.name.trim()) errors.name = "Full name is required.";
    if (!phoneRegex.test(formData.phone.trim())) errors.phone = "Enter a valid phone number (10-15 digits).";
    if (!emailRegex.test(formData.email.trim())) errors.email = "Enter a valid email address.";
    if (!formData.income || Number(formData.income) <= 0) errors.income = "Income must be greater than 0.";
    if (!formData.loanAmount || Number(formData.loanAmount) <= 0) errors.loanAmount = "Loan amount must be greater than 0.";
    if (!formData.employmentType) errors.employmentType = "Please select employment type.";

    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setResult(null);

    try {
      const payload = {
        ...formData,
        income: Number(formData.income),
        loanAmount: Number(formData.loanAmount),
        source: "Website",
      };
      const response = await applyLoanApi(payload);
      setResult(response);
      setFormData(initialForm);
      setSuccessOpen(true);
      toast.success(response.message || "Application submitted.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to submit application."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupportChange = (event) => {
    const { name, value } = event.target;
    setSupportForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSupportSubmit = (event) => {
    event.preventDefault();
    toast.success("Support request received. Our team will reach out soon.");
    setSupportForm(supportInitialForm);
  };

  const getRealtimeEmiPreview = () => {
    const principal = Number(formData.loanAmount);
    const annualRatePercent = 12;
    const tenureMonths = 24;
    if (!principal || principal <= 0) return null;

    const monthlyRate = annualRatePercent / 12 / 100;
    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
    const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
    const monthlyEmi = denominator ? numerator / denominator : principal / tenureMonths;
    const totalPayable = monthlyEmi * tenureMonths;
    const totalInterest = totalPayable - principal;

    return {
      monthlyEmi: Number(monthlyEmi.toFixed(2)),
      totalPayable: Number(totalPayable.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      interestRate: annualRatePercent,
      tenureMonths,
    };
  };

  const emiPreview = getRealtimeEmiPreview();

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          border: 1,
          borderColor: "divider",
          background:
            "linear-gradient(132deg, rgba(11,107,203,0.96) 0%, rgba(15,159,122,0.96) 50%, rgba(40,182,121,0.94) 100%)",
          color: "#ecf6ff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            position: "absolute",
            top: -100,
            right: -70,
          }}
        />
        <Stack spacing={1.4} sx={{ position: "relative", maxWidth: 780 }}>
          <Typography variant="h1">LoanSphere: modern loans for real-life goals.</Typography>
          <Typography variant="h6" sx={{ opacity: 0.96, fontWeight: 500 }}>
            From personal plans to business growth, get trusted loan support with quick lead processing.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <Button variant="contained" color="secondary" onClick={scrollToForm}>
              Apply Now
            </Button>
            <Button component={RouterLink} to="/admin/login" variant="outlined" color="inherit">
              Admin Login
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <LoanTypes onApplyNow={scrollToForm} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <EMICalculator />
        </Grid>
        <Grid item xs={12} md={6}>
          <Eligibility />
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: 1, borderColor: "divider" }}>
        <Stack spacing={2}>
          <Typography variant="h3">How It Works</Typography>
          <Grid container spacing={1.5}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={step.title}>
                <Paper sx={{ p: 2.2, border: 1, borderColor: "divider", height: "100%" }}>
                  <Typography variant="h5" color="primary.main">
                    {index + 1}
                  </Typography>
                  <Typography variant="h6">{step.title}</Typography>
                  <Typography color="text.secondary">{step.description}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: 1, borderColor: "divider" }}>
        <Stack spacing={2}>
          <Typography variant="h3">Why Choose LoanSphere</Typography>
          <Grid container spacing={1.5}>
            {uiLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Grid item xs={12} sm={6} md={3} key={`skeleton-${index}`}>
                    <Paper sx={{ p: 2.2, border: 1, borderColor: "divider" }}>
                      <Skeleton variant="circular" width={42} height={42} />
                      <Skeleton sx={{ mt: 1 }} width="70%" />
                      <Skeleton width="100%" />
                      <Skeleton width="90%" />
                    </Paper>
                  </Grid>
                ))
              : featureCards.map((feature) => (
                  <Grid item xs={12} sm={6} md={3} key={feature.title}>
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
                        <Box sx={{ color: "primary.main" }}>{feature.icon}</Box>
                        <Typography variant="h6">{feature.title}</Typography>
                        <Typography color="text.secondary">{feature.description}</Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
          </Grid>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: 1, borderColor: "divider" }}>
        <Stack spacing={2}>
          <Typography variant="h3">Customer Testimonials</Typography>
          <Grid container spacing={1.5}>
            {testimonials.map((item) => (
              <Grid item xs={12} md={3} key={item.name}>
                <Paper sx={{ p: 2.2, border: 1, borderColor: "divider", height: "100%" }}>
                  <Stack spacing={1}>
                    <Typography color="primary.main" variant="h6">
                      "
                    </Typography>
                    <Typography color="text.secondary">{item.text}</Typography>
                    <Typography variant="subtitle2">{item.name}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: 1, borderColor: "divider" }}>
        <Typography variant="h3" sx={{ mb: 1.5 }}>
          FAQs
        </Typography>
        {faqs.map((faq) => (
          <Accordion key={faq.question} disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: 1, borderColor: "divider" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Stack spacing={1.2}>
              <Typography variant="h3">Contact & Support</Typography>
              <Typography color="text.secondary">Need assistance? Reach out and our loan support team will help you.</Typography>
              <Typography><strong>Phone:</strong> +91 98765 43210</Typography>
              <Typography><strong>Email:</strong> support@loansphere.com</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={7}>
            <Stack spacing={1.4} component="form" onSubmit={handleSupportSubmit}>
              <TextField label="Your Name" name="name" value={supportForm.name} onChange={handleSupportChange} required />
              <TextField label="Your Email" name="email" type="email" value={supportForm.email} onChange={handleSupportChange} required />
              <TextField
                label="Message"
                name="message"
                value={supportForm.message}
                onChange={handleSupportChange}
                multiline
                minRows={3}
                required
              />
              <Button type="submit" variant="contained" startIcon={<ChatRoundedIcon />}>
                Send Message
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper ref={loanFormRef} sx={{ p: { xs: 2.5, md: 4 }, border: 1, borderColor: "divider" }}>
        <Stack spacing={2.2} component="form" onSubmit={handleSubmit}>
          <Typography variant="h3">Apply for Loan</Typography>
          <Typography color="text.secondary">No signup needed. Fill your details and submit your lead directly.</Typography>

          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                error={Boolean(formErrors.name)}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
                error={Boolean(formErrors.phone)}
                helperText={formErrors.phone}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                error={Boolean(formErrors.email)}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Monthly Income"
                name="income"
                type="number"
                value={formData.income}
                onChange={handleChange}
                fullWidth
                required
                error={Boolean(formErrors.income)}
                helperText={formErrors.income}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Loan Amount"
                name="loanAmount"
                type="number"
                value={formData.loanAmount}
                onChange={handleChange}
                fullWidth
                required
                error={Boolean(formErrors.loanAmount)}
                helperText={formErrors.loanAmount}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Employment Type"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                fullWidth
                required
                error={Boolean(formErrors.employmentType)}
                helperText={formErrors.employmentType}
              >
                <MenuItem value="Salaried">Salaried</MenuItem>
                <MenuItem value="Self-employed">Self-employed</MenuItem>
                <MenuItem value="Business Owner">Business Owner</MenuItem>
                <MenuItem value="Freelancer">Freelancer</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {emiPreview ? (
            <Paper sx={{ p: 1.8, border: 1, borderColor: "divider", bgcolor: "background.default" }}>
              <Typography variant="subtitle2" color="text.secondary">
                Real-time EMI preview ({emiPreview.interestRate}% for {emiPreview.tenureMonths} months)
              </Typography>
              <Typography variant="body1">Monthly EMI: INR {emiPreview.monthlyEmi.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Interest: INR {emiPreview.totalInterest.toLocaleString()} | Total Payable: INR{" "}
                {emiPreview.totalPayable.toLocaleString()}
              </Typography>
            </Paper>
          ) : null}

          <Button type="submit" size="large" variant="contained" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>

          {result ? (
            <Alert severity="success">
              Submitted successfully. Eligibility: {result.eligibility?.eligible ? "Eligible" : "Not Eligible"} | Max loan: INR{" "}
              {Number(result.eligibility?.maxLoanAllowed || 0).toLocaleString()} | EMI: INR{" "}
              {Number(result.emi?.monthlyEmi || 0).toLocaleString()}
            </Alert>
          ) : null}
        </Stack>
      </Paper>

      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{result?.popupTitle || "Application Submitted"}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Your loan lead has been received successfully. Our team will contact you shortly.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default Landing;
