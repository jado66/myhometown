import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Checkbox,
  Box,
  Paper,
  Divider,
  Button,
  Container,
} from "@mui/material";
import { CatalogItem } from "./catalogData";
import {
  CheckCircle,
  Circle,
  Email,
  Palette,
  Print,
  Refresh,
  ArrowBack,
} from "@mui/icons-material";

export function renderCatalogItems(
  items: CatalogItem[],
  selectedItems: string[],
  handleItemSelection: (id: string) => void
) {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Card
            sx={{
              height: "100%",
              cursor: "pointer",
              border: selectedItems.includes(item.id) ? 2 : 1,
              borderColor: selectedItems.includes(item.id)
                ? "primary.main"
                : "grey.300",
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
            onClick={() => handleItemSelection(item.id)}
          >
            <CardMedia
              component="img"
              height="150"
              image={item.image}
              alt={item.title}
              sx={{ objectFit: "cover" }}
            />
            <CardContent sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  component="h3"
                  sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
                >
                  {item.title}
                </Typography>
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleItemSelection(item.id)}
                  color="primary"
                  size="small"
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.8rem" }}
              >
                {item.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export function renderStarterKitContent(
  renderCatalogItemsFn: any,
  starterKitItems: CatalogItem[]
) {
  return (
    <Box>
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          City Starter Kit
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          This kit contains everything you'll need to have a grand opening event
          for your city. We require 7-9 weeks of lead time before your grand
          opening event.
        </Typography>
        <Typography variant="h6" gutterBottom>
          Included Items:
        </Typography>
        <Grid container spacing={2}>
          {[
            "Welcome Banners",
            "Grand Opening Fliers and Jpegs",
            "Flags",
            "Table Cloths",
            "Pop-up tent templates",
            "Pop-up banners",
            "Opening Class Schedule",
          ].map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Circle sx={{ fontSize: 8, mr: 1, color: "primary.main" }} />
                <Typography variant="body2">{item}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
      {renderCatalogItemsFn(starterKitItems)}
    </Box>
  );
}

export function renderSuccessPage(
  submittedOrderData: any,
  handleBackToForm: () => void
) {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
        <Box sx={{ mb: 4 }}>
          <CheckCircle
            sx={{
              fontSize: 80,
              color: "success.main",
              mb: 2,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", color: "success.dark", mb: 2 }}
          >
            Order Submitted Successfully!
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: "auto" }}
          >
            Thank you for your order, {submittedOrderData?.name}! We've received
            your design request and will confirm receipt within 24 hours.
          </Typography>
        </Box>
        <Divider sx={{ my: 4 }} />
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            Order Summary
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              mt: 2,
              backgroundColor: "background.paper",
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item>
                <Email color="primary" />
              </Grid>
              <Grid item xs>
                <Typography variant="body1">
                  <strong>Confirmation sent to:</strong>{" "}
                  {submittedOrderData?.email}
                </Typography>
              </Grid>
            </Grid>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold", mt: 3 }}
            >
              Selected Items ({submittedOrderData?.items.length}):
            </Typography>
            <Box sx={{ textAlign: "left" }}>
              {submittedOrderData?.items.map((item: string, index: number) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", py: 0.5 }}
                >
                  <Circle sx={{ fontSize: 8, mr: 2, color: "primary.main" }} />
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
        <Box sx={{ mb: 4 }}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: "primary.light",
              color: "primary.contrastText",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              What happens next?
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Email sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Confirmation
                  </Typography>
                  <Typography variant="body2">
                    You'll receive an email confirmation within 24 hours
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Palette sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Design Process
                  </Typography>
                  <Typography variant="body2">
                    Our design team will customize your materials
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Print sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Print-Ready Files
                  </Typography>
                  <Typography variant="body2">
                    You'll receive designs via email for order
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleBackToForm}
            startIcon={<Refresh />}
            sx={{ px: 4, py: 1.5, fontWeight: "bold", borderRadius: 2 }}
          >
            Submit Another Order
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => window.location.reload()}
            startIcon={<ArrowBack />}
            sx={{ px: 4, py: 1.5, fontWeight: "bold", borderRadius: 2 }}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
