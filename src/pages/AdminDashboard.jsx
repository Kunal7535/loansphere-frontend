import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { Link as RouterLink } from "react-router-dom";
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../api/axios";
import {
  calculateEligibilityApi,
  calculateEmiApi,
  getDashboardStatsApi,
  getLeadsApi,
  updateLeadStatusApi,
} from "../api/adminApi";
import LoadingSpinner from "../components/LoadingSpinner";

const statusChipColor = {
  New: "info",
  Contacted: "primary",
  "In Review": "warning",
  Approved: "success",
  Rejected: "error",
  Disbursed: "secondary",
  Pending: "warning",
};

const statusRowBg = {
  New: "rgba(2, 136, 209, 0.08)",
  Contacted: "rgba(25, 118, 210, 0.08)",
  "In Review": "rgba(237, 108, 2, 0.08)",
  Approved: "rgba(46, 125, 50, 0.12)",
  Rejected: "rgba(211, 47, 47, 0.12)",
  Disbursed: "rgba(123, 31, 162, 0.12)",
  Pending: "rgba(237, 108, 2, 0.08)",
};

const defaultStats = {
  totalLeads: 0,
  newLeads: 0,
  contacted: 0,
  inReview: 0,
  approved: 0,
  rejected: 0,
  disbursed: 0,
  pending: 0,
};

const AdminDashboard = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [stats, setStats] = useState(defaultStats);
  const [charts, setCharts] = useState({ bySource: [], byMonth: [] });
  const [workflowStatuses, setWorkflowStatuses] = useState(["New", "Contacted", "In Review", "Approved", "Rejected", "Disbursed"]);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: "", status: "", source: "" });
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [eligibilityInput, setEligibilityInput] = useState({ income: "", loanAmount: "" });
  const [emiInput, setEmiInput] = useState({ loanAmount: "", interestRate: "12", tenure: "24" });
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [emiResult, setEmiResult] = useState(null);

  const statusPieData = useMemo(
    () => [
      { name: "New", value: stats.newLeads },
      { name: "Contacted", value: stats.contacted },
      { name: "In Review", value: stats.inReview },
      { name: "Approved", value: stats.approved },
      { name: "Rejected", value: stats.rejected },
      { name: "Disbursed", value: stats.disbursed },
    ],
    [stats]
  );

  const sourceOptions = useMemo(() => {
    return charts.bySource.map((item) => item.name).filter(Boolean);
  }, [charts.bySource]);

  const fetchStats = async () => {
    const response = await getDashboardStatsApi();
    setStats(response.stats || defaultStats);
    setCharts(response.charts || { bySource: [], byMonth: [] });
    if (Array.isArray(response.workflowStatuses) && response.workflowStatuses.length) {
      setWorkflowStatuses(response.workflowStatuses);
    }
  };

  const fetchLeads = async ({ page, limit, search, status, source }) => {
    setTableLoading(true);
    setError("");

    try {
      const response = await getLeadsApi({ page, limit, search, status, source });
      setLeads(response.leads || []);
      setPagination(response.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      if (Array.isArray(response.workflowStatuses) && response.workflowStatuses.length) {
        setWorkflowStatuses(response.workflowStatuses);
      }
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to fetch leads.");
      setError(message);
      toast.error(message);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchLeads({
            page: pagination.page,
            limit: pagination.limit,
            search: filters.search,
            status: filters.status,
            source: filters.source,
          }),
        ]);
      } finally {
        setInitialLoading(false);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialLoading) return;
    fetchLeads({
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      status: filters.status,
      source: filters.source,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters.search, filters.status, filters.source]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, nextPage) => {
    setPagination((prev) => ({ ...prev, page: nextPage + 1 }));
  };

  const handleRowsPerPageChange = (event) => {
    setPagination((prev) => ({ ...prev, limit: Number(event.target.value), page: 1 }));
  };

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const response = await updateLeadStatusApi(id, { status });
      toast.success(response.message || "Status updated.");
      await Promise.all([
        fetchStats(),
        fetchLeads({
          page: pagination.page,
          limit: pagination.limit,
          search: filters.search,
          status: filters.status,
          source: filters.source,
        }),
      ]);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to update lead."));
    } finally {
      setUpdatingId("");
    }
  };

  const runEligibility = async () => {
    try {
      const response = await calculateEligibilityApi({
        income: Number(eligibilityInput.income),
        loanAmount: Number(eligibilityInput.loanAmount),
      });
      setEligibilityResult(response.eligibility);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to calculate eligibility."));
    }
  };

  const runEmi = async () => {
    try {
      const response = await calculateEmiApi({
        loanAmount: Number(emiInput.loanAmount),
        interestRate: Number(emiInput.interestRate),
        tenure: Number(emiInput.tenure),
      });
      setEmiResult(response.emi);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to calculate EMI."));
    }
  };

  if (initialLoading) {
    return <LoadingSpinner label="Loading admin dashboard..." />;
  }

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 3, border: 1, borderColor: "divider" }}>
        <Typography variant="h3">CRM Dashboard</Typography>
        <Typography color="text.secondary">Track lead journey, manage notes, and move leads through workflow.</Typography>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
            xl: "repeat(7, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {[
          { label: "Total Leads", value: stats.totalLeads },
          { label: "New", value: stats.newLeads },
          { label: "Contacted", value: stats.contacted },
          { label: "In Review", value: stats.inReview },
          { label: "Approved", value: stats.approved },
          { label: "Rejected", value: stats.rejected },
          { label: "Disbursed", value: stats.disbursed },
        ].map((card) => (
          <Paper key={card.label} sx={{ p: 2, border: 1, borderColor: "divider", minHeight: 95 }}>
            <Typography color="text.secondary">{card.label}</Typography>
            <Typography variant="h5">{card.value}</Typography>
          </Paper>
        ))}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, border: 1, borderColor: "divider", height: "100%" }}>
            <Typography variant="h6">Status Distribution</Typography>
            <Box sx={{ height: 240, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" nameKey="name" outerRadius={82} fill="#0b6bcb" label />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, border: 1, borderColor: "divider", height: "100%" }}>
            <Typography variant="h6">Lead Sources</Typography>
            <Box sx={{ height: 240, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.bySource || []}>
                  <XAxis dataKey="name" hide />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0f9f7a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, border: 1, borderColor: "divider", height: "100%" }}>
            <Typography variant="h6">Leads by Month</Typography>
            <Box sx={{ height: 240, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.byMonth || []}>
                  <XAxis dataKey="name" hide />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1e88e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, border: 1, borderColor: "divider", height: "100%" }}>
            <Typography variant="h6">Eligibility Calculator</Typography>
            <Stack spacing={1.2} sx={{ mt: 1.2 }}>
              <TextField
                label="Monthly Income"
                type="number"
                value={eligibilityInput.income}
                onChange={(e) => setEligibilityInput((prev) => ({ ...prev, income: e.target.value }))}
              />
              <TextField
                label="Loan Amount"
                type="number"
                value={eligibilityInput.loanAmount}
                onChange={(e) => setEligibilityInput((prev) => ({ ...prev, loanAmount: e.target.value }))}
              />
              <Button variant="outlined" onClick={runEligibility}>
                Check
              </Button>
              {eligibilityResult ? (
                <Alert severity={eligibilityResult.eligible ? "success" : "warning"}>
                  {eligibilityResult.eligible ? "Eligible" : "Not Eligible"} | Max: INR{" "}
                  {Number(eligibilityResult.maxLoanAllowed || 0).toLocaleString()}
                </Alert>
              ) : null}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2.5, border: 1, borderColor: "divider", height: "100%" }}>
            <Typography variant="h6">EMI Calculator</Typography>
            <Stack spacing={1.2} sx={{ mt: 1.2 }}>
              <TextField
                label="Loan Amount"
                type="number"
                value={emiInput.loanAmount}
                onChange={(e) => setEmiInput((prev) => ({ ...prev, loanAmount: e.target.value }))}
              />
              <TextField
                label="Interest Rate (%)"
                type="number"
                value={emiInput.interestRate}
                onChange={(e) => setEmiInput((prev) => ({ ...prev, interestRate: e.target.value }))}
              />
              <TextField
                label="Tenure (months)"
                type="number"
                value={emiInput.tenure}
                onChange={(e) => setEmiInput((prev) => ({ ...prev, tenure: e.target.value }))}
              />
              <Button variant="outlined" onClick={runEmi}>
                Calculate
              </Button>
              {emiResult ? (
                <Alert severity="info">
                  EMI: INR {Number(emiResult.monthlyEmi || 0).toLocaleString()} | Total: INR{" "}
                  {Number(emiResult.totalPayment || 0).toLocaleString()}
                </Alert>
              ) : null}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, border: 1, borderColor: "divider" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.2}>
          <TextField
            label="Search by name or phone"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            fullWidth
          />
          <TextField select label="Status" name="status" value={filters.status} onChange={handleFilterChange} sx={{ minWidth: 180 }}>
            <MenuItem value="">All</MenuItem>
            {workflowStatuses.map((status) => (
              <MenuItem value={status} key={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Source" name="source" value={filters.source} onChange={handleFilterChange} sx={{ minWidth: 180 }}>
            <MenuItem value="">All</MenuItem>
            {sourceOptions.map((source) => (
              <MenuItem value={source} key={source}>
                {source}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableLoading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`loading-${idx}`}>
                      <TableCell colSpan={6}>
                        <Skeleton height={30} />
                      </TableCell>
                    </TableRow>
                  ))
                : leads.length
                ? leads.map((lead) => (
                    <TableRow
                      key={lead._id}
                      hover
                      sx={{
                        backgroundColor: statusRowBg[lead.status] || "transparent",
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight={700}>{lead.name}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {lead.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{lead.phone}</Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.6 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PhoneRoundedIcon />}
                            component="a"
                            href={`tel:${lead.phone}`}
                          >
                            Call
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<WhatsAppIcon />}
                            component="a"
                            target="_blank"
                            rel="noreferrer"
                            href={`https://wa.me/${String(lead.phone).replace(/\D/g, "")}`}
                          >
                            WhatsApp
                          </Button>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={lead.status}
                          onChange={(event) => handleUpdateStatus(lead._id, event.target.value)}
                          disabled={updatingId === lead._id}
                          sx={{ minWidth: 145 }}
                        >
                          {workflowStatuses.map((status) => (
                            <MenuItem value={status} key={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </TextField>
                        <Box sx={{ mt: 0.8 }}>
                          <Chip label={lead.status} color={statusChipColor[lead.status] || "default"} size="small" />
                        </Box>
                      </TableCell>
                      <TableCell>{lead.source || "Website"}</TableCell>
                      <TableCell>{lead.notesCount || 0}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          endIcon={<OpenInNewRoundedIcon />}
                          component={RouterLink}
                          to={`/admin/leads/${lead._id}`}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary">No leads found for selected filters.</Typography>
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={pagination.total}
          page={Math.max(pagination.page - 1, 0)}
          rowsPerPage={pagination.limit}
          rowsPerPageOptions={[5, 10, 20, 50]}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>
    </Stack>
  );
};

export default AdminDashboard;
