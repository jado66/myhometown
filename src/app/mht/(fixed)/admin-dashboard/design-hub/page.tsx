"use client";
import { useState } from "react";
import type React from "react";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Checkbox,
  CardMedia,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Badge,
  CircularProgress,
} from "@mui/material";
import {
  Print as PrintIcon,
  Circle as CircleIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  LocationCity,
  Palette,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price?: string;
  category: string;
}

const designCatalogItems: CatalogItem[] = [
  {
    id: "welcome-banners",
    title: "Welcome Banners",
    description: "Professional welcome banners for your community events",
    image: "/placeholder.svg?height=200&width=300",
    category: "design",
  },
  {
    id: "class-schedules",
    title: "Class Schedules",
    description: '8.5" x 11" or 11" x 17" class fliers with online jpegs',
    image: "/placeholder.svg?height=200&width=300",
    category: "design",
  },
  {
    id: "outdoor-flags",
    title: "Outdoor Flags",
    description: '24" x 36" poster options with various templates',
    image: "/placeholder.svg?height=200&width=300",
    category: "design",
  },
  {
    id: "popup-banners",
    title: "Pop-up Banners",
    description: "Portable banner displays for events and promotions",
    image: "/placeholder.svg?height=200&width=300",
    category: "design",
  },
  {
    id: "posters",
    title: "Posters",
    description: "Custom poster designs for announcements and events",
    image: "/placeholder.svg?height=200&width=300",
    category: "design",
  },
  {
    id: "web-posts",
    title: "Web Posts",
    description: "Social media and web graphics for online promotion",
    image: "/placeholder.svg?height=200&width=300",
    category: "design",
  },
];

const swagCatalogItems: CatalogItem[] = [
  {
    id: "t-shirts",
    title: "T-Shirts",
    description: "Custom branded t-shirts for your community",
    image: "/placeholder.svg?height=200&width=300",
    category: "swag",
  },
  {
    id: "hoodies",
    title: "Hoodies",
    description: "Comfortable hoodies with your community branding",
    image: "/placeholder.svg?height=200&width=300",
    category: "swag",
  },
  {
    id: "hats",
    title: "Hats",
    description: "Branded caps and beanies for community members",
    image: "/placeholder.svg?height=200&width=300",
    category: "swag",
  },
  {
    id: "water-bottles",
    title: "Water Bottles",
    description: "Eco-friendly water bottles with community logos",
    image: "/placeholder.svg?height=200&width=300",
    category: "swag",
  },
  {
    id: "buttons",
    title: "Buttons",
    description: "Custom buttons and pins for events and campaigns",
    image: "/placeholder.svg?height=200&width=300",
    category: "swag",
  },
  {
    id: "business-cards",
    title: "Business Cards",
    description: "Professional business cards for community leaders",
    image: "/placeholder.svg?height=200&width=300",
    category: "swag",
  },
];

const starterKitItems: CatalogItem[] = [
  {
    id: "starter-kit-complete",
    title: "Complete City Starter Kit",
    description:
      "Everything you need for a grand opening event - 7-9 weeks lead time required",
    image: "/placeholder.svg?height=200&width=300",
    category: "starter-kit",
  },
];

export default function MHTDesignHub() {
  const [showDialog, setShowDialog] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("design");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [submittedOrderData, setSubmittedOrderData] = useState<{
    items: string[];
    name: string;
    email: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    email: "",
    phone: "",
    locationType: "",
    community: "",
    city: "",
    additionalRequests: "",
  });

  const allItems = [
    ...designCatalogItems,
    ...swagCatalogItems,
    ...starterKitItems,
  ];

  const handleDialogProceed = () => {
    setShowDialog(false);
  };

  const handleDialogBack = () => {
    window.history.back();
  };

  const getItemCountForCategory = (category: string) => {
    return selectedItems.filter((itemId) => {
      const item = allItems.find((item) => item.id === itemId);
      return item?.category === category;
    }).length;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const removeFromCart = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create email content
      const locationInformation =
        formData.locationType === "city"
          ? `City: ${
              formData.city.endsWith("City")
                ? formData.city
                : `${formData.city} City`
            }`
          : formData.locationType === "community"
          ? `Community: ${
              formData.community.endsWith("Community")
                ? formData.community
                : `${formData.community} Community`
            }`
          : "myHometown Utah";

      // Send email using the existing API endpoint
      const response = await fetch(
        "/api/communications/send-mail/to-design-hub ",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: `MHT Design Hub Order Request - ${formData.name}`,
            html: {
              // Adapting to your existing email format structure
              firstName: formData.name.split(" ")[0] || formData.name,
              lastName: formData.name.split(" ").slice(1).join(" ") || "",
              email: formData.email,
              phone: formData.phone,
              title: formData.title,
              location: locationInformation,
              message: `Design Hub Order Request:


Selected Items (${selectedItems.length}):
${selectedItems
  .map((id) => {
    const item = allItems.find((i) => i.id === id);
    return `- ${item?.title} (${item?.category})`;
  })
  .join("\n")}

${
  formData.additionalRequests
    ? `Additional Requests: ${formData.additionalRequests}`
    : ""
}

Submitted: ${new Date().toLocaleString()}`,
            },
          }),
        }
      );

      if (response.ok) {
        setSubmittedOrderData({
          items: selectedItems.map((id) => {
            const item = allItems.find((i) => i.id === id);
            return item?.title || "";
          }),
          name: formData.name,
          email: formData.email,
        });
        setShowSuccessPage(true);

        // Reset form
        setSelectedItems([]);
        setFormData({
          title: "",
          name: "",
          email: "",
          phone: "",
          locationType: "",
          community: "",
          city: "",
          additionalRequests: "",
        });
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert(
        "There was an error submitting your order. Please try again or contact support."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setShowSuccessPage(false);
    setSubmittedOrderData(null);
  };

  const renderCatalogItems = (items: CatalogItem[]) => (
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

  const renderStarterKitContent = () => (
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
                <CircleIcon
                  sx={{ fontSize: 8, mr: 1, color: "primary.main" }}
                />
                <Typography variant="body2">{item}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
      {renderCatalogItems(starterKitItems)}
    </Box>
  );

  const selectedItemsData = selectedItems
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean);

  const renderSuccessPage = () => (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <Box sx={{ mb: 4 }}>
          <CheckCircleIcon
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
            sx={{
              fontWeight: "bold",
              color: "success.dark",
              mb: 2,
            }}
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
                <EmailIcon color="primary" />
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
              {submittedOrderData?.items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    py: 0.5,
                  }}
                >
                  <CircleIcon
                    sx={{ fontSize: 8, mr: 2, color: "primary.main" }}
                  />
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
                  <EmailIcon sx={{ fontSize: 40, mb: 1 }} />
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
                  <PrintIcon sx={{ fontSize: 40, mb: 1 }} />
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
            startIcon={<RefreshIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: "bold",
              borderRadius: 2,
            }}
          >
            Submit Another Order
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => window.location.reload()}
            startIcon={<ArrowBackIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: "bold",
              borderRadius: 2,
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );

  if (showSuccessPage) {
    return renderSuccessPage();
  }

  return (
    <>
      <Dialog
        open={showDialog}
        onClose={() => {}} // Prevent closing by clicking outside
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Executive Access Required
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
            Please proceed only if you are a myHometown executive
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleDialogBack}
            startIcon={<ArrowBackIcon />}
            sx={{ minWidth: 120 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleDialogProceed}
            sx={{ minWidth: 120, fontWeight: "bold" }}
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box
          sx={{
            p: 4,
            mb: 2,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: "bold", mt: 3 }}
          >
            MHT Design Hub
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} sx={{ px: 3 }}>
              <Box
                component="img"
                src="/placeholder.svg"
                alt="Placeholder Image"
                sx={{
                  width: "100%",
                  height: "300px",
                  borderRadius: 2,
                  boxShadow: 2,
                  objectFit: "cover",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                Order Templated Material
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium", mb: 2 }}>
                Order templated material that's ready to print!
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium", mb: 2 }}>
                MyHometown and the Brigham Young Design Department have a
                partnership that allows for your city to utilize these resources
                and ask for them to be customized for your community needs.
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium", mb: 2 }}>
                We employ design students who have been informed of our brand
                standards and know how to make this process as simple as
                possible for you. This service is independently funded and is at
                no cost to your community.
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "medium", mb: 2 }}>
                Select from the catalog below, fill out the request form and all
                relevant information, and we'll process your order and send you
                print-ready files!
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          {/* Left Column - Catalog Items */}
          <Grid item xs={12} lg={7}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 3 }}
            >
              Select Items From Catalog
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Palette />
                      Design Catalog ({getItemCountForCategory("design")})
                    </Box>
                  }
                  value="design"
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Badge />
                      Swag Catalog ({getItemCountForCategory("swag")})
                    </Box>
                  }
                  value="swag"
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationCity />
                      City Starter Kit ({getItemCountForCategory("starter-kit")}
                      )
                    </Box>
                  }
                  value="starter-kit"
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            {activeTab === "design" && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Select multiple items from our design catalog (you can choose
                  as many as you need):
                </Typography>
                {renderCatalogItems(designCatalogItems)}
              </Box>
            )}

            {activeTab === "swag" && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Select multiple items from our swag catalog (you can choose as
                  many as you need):
                </Typography>
                {renderCatalogItems(swagCatalogItems)}
              </Box>
            )}

            {activeTab === "starter-kit" && renderStarterKitContent()}
          </Grid>

          {/* Right Column - Shopping Cart and Form */}
          <Grid item xs={12} lg={5}>
            <Box sx={{ position: "sticky", top: 20 }}>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <ShoppingCartIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Selected Items ({selectedItems.length})
                  </Typography>
                </Box>

                {selectedItems.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    No items selected yet. Browse the catalog and select items
                    to add them here.
                  </Typography>
                ) : (
                  <Box>
                    {selectedItemsData.map((item) => (
                      <Box key={item.id} sx={{ mb: 2 }}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: "bold" }}
                              >
                                {item.title}
                              </Typography>
                              <Chip
                                label={
                                  item.category === "starter-kit"
                                    ? "Starter Kit"
                                    : item.category === "design"
                                    ? "Design"
                                    : "Swag"
                                }
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => removeFromCart(item.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>

              {/* Order Form */}
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  Order Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      variant="outlined"
                      required
                      size="small"
                      placeholder="e.g., Executive Secretary, City Chair, Technology Specialist"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      variant="outlined"
                      required
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      variant="outlined"
                      required
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      variant="outlined"
                      required
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth required size="small">
                      <InputLabel>Location Type</InputLabel>
                      <Select
                        value={formData.locationType}
                        onChange={(e) =>
                          handleInputChange("locationType", e.target.value)
                        }
                        label="Location Type"
                      >
                        <MenuItem value="myHometown Utah">
                          myHometown Utah
                        </MenuItem>
                        <MenuItem value="city">City</MenuItem>
                        <MenuItem value="community">Community</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.locationType === "city" && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="City Name"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        variant="outlined"
                        required
                        size="small"
                      />
                    </Grid>
                  )}

                  {formData.locationType === "community" && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Community Name"
                        value={formData.community}
                        onChange={(e) =>
                          handleInputChange("community", e.target.value)
                        }
                        variant="outlined"
                        required
                        size="small"
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Requests"
                      multiline
                      rows={3}
                      value={formData.additionalRequests}
                      onChange={(e) =>
                        handleInputChange("additionalRequests", e.target.value)
                      }
                      variant="outlined"
                      helperText="Please include any special instructions, quantities, dates, or other relevant information"
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleSubmit}
                      fullWidth
                      sx={{ fontWeight: "bold", py: 1.5 }}
                      disabled={
                        !formData.title ||
                        !formData.name ||
                        !formData.email ||
                        !formData.phone ||
                        !formData.locationType ||
                        selectedItems.length === 0 ||
                        isSubmitting
                      }
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "SUBMIT ORDER"
                      )}
                    </Button>
                  </Grid>
                </Grid>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, textAlign: "center" }}
                >
                  We will confirm receipt of your request within 24hrs
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Contact Information */}
        <Paper elevation={1} sx={{ mt: 4, p: 3, bgcolor: "grey.50" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <EmailIcon color="primary" />
            </Grid>
            <Grid item xs>
              <Typography variant="body2">
                Questions? Contact us for more information about our design
                services.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
}
