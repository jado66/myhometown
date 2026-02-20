"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  CheckCircle,
  Delete,
  Info,
  Save,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";

// ─── Variable interpolation (shared with signature page) ─────────────────────
const SAMPLE_VARS = {
  name: "Jane Smith",
  date: new Date().toLocaleDateString(),
  address: "123 Main St, West Valley City, UT 84119",
  organization: "myHometown",
  partner: "", // filled from form partner_name
};

function interpolate(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

function RichParagraph({ text, vars }) {
  const resolved = interpolate(text, vars);
  const lines = resolved.split("\n");
  return (
    <Typography variant="body2" paragraph sx={{ mb: 1 }}>
      {lines.map((line, li) => {
        const parts = line.split(/\*\*([^*]+)\*\*/g);
        return (
          <React.Fragment key={li}>
            {li > 0 && <br />}
            {parts.map((p, i) =>
              i % 2 === 1 ? <strong key={i}>{p}</strong> : p,
            )}
          </React.Fragment>
        );
      })}
    </Typography>
  );
}

// ─── Helper: blank form ───────────────────────────────────────────────────────
const blankForm = (cityId = null, cityName = "") => ({
  id: null,
  city_id: cityId,
  cityName,
  title: "Property Owner Release Form",
  partner_name: cityName,
  content: [
    "{{organization}} aims to strengthen our community by assisting in the cleaning, repair, beautification, and rehabilitation of existing owner-occupied housing. As a property owner, I agree to accept the volunteer services of {{partner}}, its volunteers, and partners in connection with this program. I agree that volunteers and other representatives of the city or its partners may come onto my property, provide labor, and otherwise assist me with my property, which is commonly known as:",
    "**Name:** {{name}}\n**Date:** {{date}}\n**Address:** {{address}}",
    "I further agree to hold harmless the volunteers, {{partner}}, and its partners (together with all their employees, members, officers, partners and directors) in connection with any services or work performed by them relating to this program, which may include but are not limited to, clean up, improvements, repairs, consultation, technical advice, financial counseling, loan processing, property inspection, mentoring, tutoring, and other related activities.",
    'I recognize that all services and work are provided "as is," with NO WARRANTIES WHATSOEVER except as expressly agreed by the service provider in writing.',
    "Photographic Release. I understand and agree that before, during and after the services and work provided as stated herein, I or my home and property may be photographed and/or videotaped by {{partner}} or its representatives and partners for internal and/or promotional use. I hereby grant permission and convey to {{partner}} and its representatives and partners, all right, title, and interest, including but not limited to, any royalties, proceeds, or other benefits, in any and all such photographs or recordings, and consent to such parties' use of my name, image, likeness, and voice in perpetuity, in any medium or format, for any publicity, without further compensation or permission.",
  ],
  is_active: true,
});

// ─── Variable reference chip ──────────────────────────────────────────────────
const VAR_CHIPS = [
  "{{name}}",
  "{{date}}",
  "{{address}}",
  "{{organization}}",
  "{{partner}}",
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReleaseFormsAdminPage() {
  const [cities, setCities] = useState([]);
  const [forms, setForms] = useState({}); // keyed by city_id (null key = "default")
  const [selectedKey, setSelectedKey] = useState("default");
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // ── Load cities + existing forms ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: citiesData }, { data: formsData }] = await Promise.all([
        supabase.from("cities").select("id, name, state").order("name"),
        supabase.from("property_release_forms").select("*"),
      ]);

      setCities(citiesData ?? []);

      // Build a map: null -> default form, cityId -> city form
      const map = {};
      for (const f of formsData ?? []) {
        map[f.city_id ?? "default"] = f;
      }
      setForms(map);
      setLoading(false);
    };
    load();
  }, []);

  // ── Select item from sidebar ─────────────────────────────────────────────
  const handleSelect = useCallback(
    (key) => {
      if (dirty && !confirm("You have unsaved changes. Discard them?")) return;
      setSelectedKey(key);
      setDirty(false);

      if (forms[key]) {
        const f = forms[key];
        const city = cities.find((c) => c.id === f.city_id);
        setEditForm({
          ...f,
          cityName: city ? `${city.name}, ${city.state}` : "Default",
          content: Array.isArray(f.content) ? f.content : [],
        });
      } else if (key === "default") {
        setEditForm(blankForm(null, "Default"));
      } else {
        const city = cities.find((c) => c.id === key);
        setEditForm(blankForm(key, city ? `${city.name}, ${city.state}` : key));
      }
    },
    [dirty, forms, cities],
  );

  // Pre-select default on first load
  useEffect(() => {
    if (!loading) handleSelect("default");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // ── Field helpers ─────────────────────────────────────────────────────────
  const setField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const setParagraph = (idx, value) => {
    setEditForm((prev) => {
      const content = [...prev.content];
      content[idx] = value;
      return { ...prev, content };
    });
    setDirty(true);
  };

  const addParagraph = () => {
    setEditForm((prev) => ({ ...prev, content: [...prev.content, ""] }));
    setDirty(true);
  };

  const removeParagraph = (idx) => {
    setEditForm((prev) => {
      const content = prev.content.filter((_, i) => i !== idx);
      return { ...prev, content };
    });
    setDirty(true);
  };

  const moveParagraph = (idx, dir) => {
    setEditForm((prev) => {
      const content = [...prev.content];
      const swap = idx + dir;
      if (swap < 0 || swap >= content.length) return prev;
      [content[idx], content[swap]] = [content[swap], content[idx]];
      return { ...prev, content };
    });
    setDirty(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        city_id: editForm.city_id,
        title: editForm.title,
        partner_name: editForm.partner_name,
        content: editForm.content,
        is_active: editForm.is_active ?? true,
      };

      let result;
      if (editForm.id) {
        result = await supabase
          .from("property_release_forms")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editForm.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("property_release_forms")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      const saved = result.data;
      const key = saved.city_id ?? "default";
      setForms((prev) => ({ ...prev, [key]: saved }));
      setEditForm((prev) => ({ ...prev, id: saved.id }));
      setDirty(false);
      toast.success("Release form saved.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete (revert city to default) ──────────────────────────────────────
  const handleDelete = async () => {
    if (!editForm?.id) return;
    if (
      !confirm("Delete this city's custom form? It will revert to the default.")
    )
      return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("property_release_forms")
        .delete()
        .eq("id", editForm.id);
      if (error) throw error;

      const key = editForm.city_id ?? "default";
      setForms((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      const city = cities.find((c) => c.id === editForm.city_id);
      setEditForm(
        blankForm(editForm.city_id, city ? `${city.name}, ${city.state}` : key),
      );
      setDirty(false);
      toast.success("Custom form deleted. City will now use the default.");
    } catch (err) {
      toast.error("Failed to delete: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Preview vars ──────────────────────────────────────────────────────────
  const previewVars = {
    ...SAMPLE_VARS,
    partner: editForm?.partner_name || "{{partner}}",
    organization: "myHometown",
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Property Release Forms
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        One form per city. Cities without a custom form automatically use the
        default.
      </Typography>

      <Grid container spacing={2} alignItems="flex-start">
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <Grid item xs={12} md={3}>
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: "grey.50",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Forms
              </Typography>
            </Box>
            <List dense disablePadding>
              {/* Default row */}
              <ListItemButton
                selected={selectedKey === "default"}
                onClick={() => handleSelect("default")}
                sx={{ borderBottom: "1px solid", borderColor: "divider" }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={600}>
                      Default
                    </Typography>
                  }
                  secondary="Used when no city override exists"
                />
                {forms["default"] && (
                  <Tooltip title="Saved">
                    <CheckCircle
                      fontSize="small"
                      sx={{ color: "success.main", ml: 1 }}
                    />
                  </Tooltip>
                )}
              </ListItemButton>

              {/* City rows */}
              {cities.map((city) => {
                const hasCustom = !!forms[city.id];
                return (
                  <ListItemButton
                    key={city.id}
                    selected={selectedKey === city.id}
                    onClick={() => handleSelect(city.id)}
                    sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2">{city.name}</Typography>
                      }
                      secondary={city.state}
                    />
                    {hasCustom ? (
                      <Tooltip title="Custom form">
                        <CheckCircle
                          fontSize="small"
                          sx={{ color: "primary.main", ml: 1 }}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Using default">
                        <Chip
                          label="default"
                          size="small"
                          sx={{ ml: 1, fontSize: "0.65rem" }}
                        />
                      </Tooltip>
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* ── Editor + Preview ───────────────────────────────────────────── */}
        {editForm && (
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              {/* Editor */}
              <Grid item xs={12} lg={6}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      {editForm.city_id
                        ? `${editForm.cityName} — Custom Form`
                        : "Default Form"}
                    </Typography>
                    <Stack direction="row" gap={1}>
                      {editForm.id && editForm.city_id && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={handleDelete}
                          disabled={saving}
                        >
                          Delete
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={
                          saving ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <Save />
                          )
                        }
                        onClick={handleSave}
                        disabled={saving || !dirty}
                      >
                        Save
                      </Button>
                    </Stack>
                  </Stack>

                  <TextField
                    label="Form Title"
                    value={editForm.title}
                    onChange={(e) => setField("title", e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Partner / City Name"
                    value={editForm.partner_name ?? ""}
                    onChange={(e) => setField("partner_name", e.target.value)}
                    fullWidth
                    size="small"
                    helperText="Used for {{partner}} in the form text"
                    sx={{ mb: 2 }}
                  />

                  <Divider sx={{ mb: 2 }} />

                  {/* Variable reference */}
                  <Box sx={{ mb: 2 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={0.5}
                      sx={{ mb: 0.75 }}
                    >
                      <Info fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Available variables — click to copy
                      </Typography>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {VAR_CHIPS.map((v) => (
                        <Chip
                          key={v}
                          label={v}
                          size="small"
                          variant="outlined"
                          clickable
                          onClick={() => navigator.clipboard.writeText(v)}
                          sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Paragraph editors */}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Paragraphs
                  </Typography>
                  <Stack gap={1.5}>
                    {editForm.content.map((para, idx) => (
                      <Card
                        key={idx}
                        variant="outlined"
                        sx={{ borderRadius: 1.5 }}
                      >
                        <CardContent
                          sx={{ pb: "8px !important", pt: 1.5, px: 1.5 }}
                        >
                          <Stack
                            direction="row"
                            alignItems="flex-start"
                            gap={0.5}
                            sx={{ mb: 0.5 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ pt: 0.5, minWidth: 18 }}
                            >
                              {idx + 1}
                            </Typography>
                            <TextField
                              value={para}
                              onChange={(e) =>
                                setParagraph(idx, e.target.value)
                              }
                              fullWidth
                              multiline
                              minRows={2}
                              size="small"
                              placeholder="Paragraph text… use {{name}}, {{date}}, **bold**, \n for line breaks"
                              inputProps={{ style: { fontSize: "0.8rem" } }}
                            />
                            <Stack>
                              <Tooltip title="Move up">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => moveParagraph(idx, -1)}
                                    disabled={idx === 0}
                                  >
                                    <ArrowUpward fontSize="inherit" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Move down">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => moveParagraph(idx, 1)}
                                    disabled={
                                      idx === editForm.content.length - 1
                                    }
                                  >
                                    <ArrowDownward fontSize="inherit" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Delete paragraph">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeParagraph(idx)}
                                >
                                  <Delete fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>

                  <Button
                    startIcon={<Add />}
                    size="small"
                    onClick={addParagraph}
                    sx={{ mt: 1.5 }}
                  >
                    Add Paragraph
                  </Button>
                </Paper>
              </Grid>

              {/* Preview */}
              <Grid item xs={12} lg={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 2, position: "sticky", top: 16 }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 0.5 }}
                  >
                    Preview
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 2 }}
                  >
                    Variables are filled with sample values
                  </Typography>

                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.5,
                      overflow: "hidden",
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        bgcolor: "grey.100",
                        px: 2,
                        py: 1.25,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ fontSize: "0.75rem" }}
                      >
                        myHometown
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {editForm.title?.toUpperCase()}
                      </Typography>
                    </Box>

                    {/* Content */}
                    <Box
                      sx={{
                        px: 2,
                        py: 1.5,
                        maxHeight: 480,
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: "5px" },
                        "&::-webkit-scrollbar-thumb": {
                          bgcolor: "grey.300",
                          borderRadius: 2,
                        },
                      }}
                    >
                      {editForm.content.length === 0 ? (
                        <Typography
                          variant="body2"
                          color="text.disabled"
                          fontStyle="italic"
                        >
                          No paragraphs yet.
                        </Typography>
                      ) : (
                        editForm.content.map((para, idx) => (
                          <RichParagraph
                            key={idx}
                            text={para}
                            vars={previewVars}
                          />
                        ))
                      )}
                    </Box>
                  </Box>

                  {/* Sample variable values */}
                  <Box
                    sx={{
                      mt: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1.5,
                      p: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ display: "block", mb: 0.75 }}
                    >
                      Sample values used in preview
                    </Typography>
                    {Object.entries(previewVars).map(([k, v]) => (
                      <Typography
                        key={k}
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", fontFamily: "monospace" }}
                      >
                        {`{{${k}}}`} → {v || <em>empty</em>}
                      </Typography>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
