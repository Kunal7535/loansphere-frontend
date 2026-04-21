import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../api/axios";
import { addLeadNoteApi, getLeadByIdApi, updateLeadStatusApi } from "../api/adminApi";

const statusChipColor = {
  New: "info",
  Contacted: "primary",
  "In Review": "warning",
  Approved: "success",
  Rejected: "error",
  Disbursed: "secondary",
};

const LeadDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [workflowStatuses, setWorkflowStatuses] = useState(["New", "Contacted", "In Review", "Approved", "Rejected", "Disbursed"]);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState("");

  const formattedPhoneForWhatsApp = useMemo(() => String(lead?.phone || "").replace(/\D/g, ""), [lead?.phone]);

  const loadLead = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getLeadByIdApi(id);
      setLead(response.lead);
      if (Array.isArray(response.workflowStatuses) && response.workflowStatuses.length) {
        setWorkflowStatuses(response.workflowStatuses);
      }
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to load lead details.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (event) => {
    if (!lead) return;
    const nextStatus = event.target.value;
    setSavingStatus(true);
    try {
      const response = await updateLeadStatusApi(lead._id, { status: nextStatus });
      setLead(response.lead);
      toast.success("Lead status updated.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to update lead status."));
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddNote = async (event) => {
    event.preventDefault();
    if (!lead || !noteText.trim()) return;
    setSavingNote(true);
    try {
      const response = await addLeadNoteApi(lead._id, { text: noteText.trim() });
      setLead(response.lead);
      setNoteText("");
      toast.success(response.message || "Note added.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to add note."));
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, border: 1, borderColor: "divider" }}>
        <Skeleton height={30} width="35%" />
        <Skeleton height={24} width="60%" />
        <Skeleton height={140} />
      </Paper>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button component={RouterLink} to="/admin/dashboard" startIcon={<ArrowBackRoundedIcon />}>
          Back to Dashboard
        </Button>
        <Chip label={lead.status} color={statusChipColor[lead.status] || "default"} />
      </Stack>

      <Paper sx={{ p: 3, border: 1, borderColor: "divider" }}>
        <Typography variant="h3">Lead Details</Typography>
        <Typography color="text.secondary">Track lead history, status progression, and admin notes.</Typography>

        <Grid container spacing={2} sx={{ mt: 0.4 }}>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">Name</Typography>
            <Typography fontWeight={700}>{lead.name}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">Phone</Typography>
            <Typography>{lead.phone}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">Email</Typography>
            <Typography>{lead.email}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">Source</Typography>
            <Typography>{lead.source || "Website"}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">Employment</Typography>
            <Typography>{lead.employmentType}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">Created</Typography>
            <Typography>{new Date(lead.createdAt).toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">Income</Typography>
            <Typography>INR {Number(lead.income).toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">Loan Amount</Typography>
            <Typography>INR {Number(lead.loanAmount).toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">Max Eligible Loan</Typography>
            <Typography>INR {Number(lead.eligibility?.maxLoanAllowed || 0).toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">EMI (Monthly)</Typography>
            <Typography>INR {Number(lead.emi?.monthlyEmi || 0).toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">EMI (Total)</Typography>
            <Typography>INR {Number(lead.emi?.totalPayment || 0).toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography color="text.secondary">Workflow Status</Typography>
            <TextField
              select
              size="small"
              value={lead.status}
              onChange={handleStatusChange}
              disabled={savingStatus}
              sx={{ minWidth: 180, mt: 0.6 }}
            >
              {workflowStatuses.map((status) => (
                <MenuItem value={status} key={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
          <Button component="a" href={`tel:${lead.phone}`} startIcon={<PhoneRoundedIcon />} variant="outlined">
            Call Lead
          </Button>
          <Button
            component="a"
            href={`https://wa.me/${formattedPhoneForWhatsApp}`}
            target="_blank"
            rel="noreferrer"
            startIcon={<WhatsAppIcon />}
            color="success"
            variant="outlined"
          >
            WhatsApp Lead
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, border: 1, borderColor: "divider" }}>
        <Typography variant="h4">Notes</Typography>
        <Stack component="form" onSubmit={handleAddNote} direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mt: 1.3 }}>
          <TextField
            fullWidth
            label="Add admin note"
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            multiline
            minRows={2}
          />
          <Button type="submit" variant="contained" disabled={savingNote} startIcon={<NoteAddRoundedIcon />}>
            {savingNote ? "Saving..." : "Add Note"}
          </Button>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.2}>
          {Array.isArray(lead.notes) && lead.notes.length ? (
            lead.notes.map((note) => (
              <Paper key={note._id || `${note.createdAt}-${note.text}`} variant="outlined" sx={{ p: 1.5 }}>
                <Typography>{note.text}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {note.createdBy || "Admin"} | {new Date(note.createdAt).toLocaleString()}
                </Typography>
              </Paper>
            ))
          ) : (
            <Typography color="text.secondary">No notes added yet.</Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default LeadDetails;
