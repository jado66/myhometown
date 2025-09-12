"use client";

import {
  flyersCatalogItems,
  certificatesCatalogItems,
  signsBannersCatalogItems,
} from "./catalogData";
import { useState } from "react";
import type React from "react";
import { CatalogItem } from "./catalogData";
import {
  renderCatalogItems,
  renderStarterKitContent,
  renderSuccessPage,
} from "./DesignHubComponents";
import CarouselComponent from "@/components/ui/Carousel";
import { LightBox } from "@/components/LightBox";
// Example images for each tab
const flyersExamples = [
  "/mht/design-hub/Classes Flyer.webp",
  "/mht/design-hub/ComingSoon-Span.webp",
  "/mht/design-hub/Door Hanger.webp",
  "/mht/design-hub/Flyer Children.webp",
  "/mht/design-hub/Flyer Classes 2.webp",
  "/mht/design-hub/Grand opening Flyer.webp",
];
const certificatesExamples = [
  "/mht/design-hub/Certificate.jpeg",
  // Add more certificate images here if available
];
const signsBannersExamples = [
  "/mht/design-hub/Banner 1.jpeg",
  "/mht/design-hub/Banner 2.jpeg",
  "/mht/design-hub/Yard Sign.jpeg",
  "/mht/design-hub/car magnets.webp",
  "/mht/design-hub/Flags.webp",
  "/mht/design-hub/Green_TableCloth.webp",
  "/mht/design-hub/tent.webp",
];
import OrderForm from "./OrderForm";
import SelectedItemsCart from "./SelectedItemsCart";
import ExecutiveAccessDialog from "./ExecutiveAccessDialog";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Divider,
  Badge,
  Button,
} from "@mui/material";

import { Email, LocationCity, Palette } from "@mui/icons-material";

  const [showDialog, setShowDialog] = useState(true);
  const [lightBoxImage, setLightBoxImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("flyers");
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

  // Removed duplicate untyped allItems declaration
  const allItems: CatalogItem[] = [
    ...flyersCatalogItems,
    ...certificatesCatalogItems,
    ...signsBannersCatalogItems,
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

  const selectedItemsData: CatalogItem[] = selectedItems
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item): item is CatalogItem => !!item);

  if (showSuccessPage) {
    return renderSuccessPage(submittedOrderData, handleBackToForm);
  }

  // Handler for opening LightBox
  const handleExampleImageClick = (imgSrc: string) => {
    setLightBoxImage(imgSrc);
  };

  const closeImageDialog = () => {
    setLightBoxImage(null);
  };

  return (
    <>
      <ExecutiveAccessDialog
        open={showDialog}
        handleDialogBack={handleDialogBack}
        handleDialogProceed={handleDialogProceed}
      />
      {/* LightBox for example images */}
      <LightBox image={lightBoxImage} closeImageDialog={closeImageDialog} />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ p: 4, mb: 2 }}>
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
                src="/mht/design-hub/placeholder.png"
                alt="Placeholder Image"
                sx={{
                  width: "100%",
                  height: "300px",
                  borderRadius: 2,
                  borderColor: "grey.300",
                  borderWidth: 1,
                  borderStyle: "solid",
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
            {/* Carousel of examples for each tab */}

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant={activeTab === "flyers" ? "contained" : "outlined"}
                    onClick={() => setActiveTab("flyers")}
                    sx={{ fontWeight: "bold" }}
                  >
                    FLYERS
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant={
                      activeTab === "certificates" ? "contained" : "outlined"
                    }
                    onClick={() => setActiveTab("certificates")}
                    sx={{ fontWeight: "bold" }}
                  >
                    CERTIFICATES
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant={
                      activeTab === "signs-banners" ? "contained" : "outlined"
                    }
                    onClick={() => setActiveTab("signs-banners")}
                    sx={{ fontWeight: "bold" }}
                  >
                    SIGNS AND BANNERS
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ mb: 3 }}>
              {activeTab === "flyers" && (
                <CarouselComponent
                  images={flyersExamples}
                  speed={700}
                  onImageClick={handleExampleImageClick}
                />
              )}
              {activeTab === "certificates" && (
                <CarouselComponent
                  images={certificatesExamples}
                  speed={700}
                  onImageClick={handleExampleImageClick}
                />
              )}
              {activeTab === "signs-banners" && (
                <CarouselComponent
                  images={signsBannersExamples}
                  speed={700}
                  onImageClick={handleExampleImageClick}
                />
              )}
            </Box>
            {activeTab === "flyers" &&
              renderCatalogItems(
                flyersCatalogItems,
                selectedItems,
                handleItemSelection
              )}
            {activeTab === "certificates" &&
              renderCatalogItems(
                certificatesCatalogItems,
                selectedItems,
                handleItemSelection
              )}
            {activeTab === "signs-banners" &&
              renderCatalogItems(
                signsBannersCatalogItems,
                selectedItems,
                handleItemSelection
              )}
          </Grid>
          {/* Right Column - Shopping Cart and Form */}
          <Grid item xs={12} lg={5}>
            <Box sx={{ position: "sticky", top: 20 }}>
              <SelectedItemsCart
                selectedItems={selectedItems}
                selectedItemsData={selectedItemsData}
                removeFromCart={removeFromCart}
              />
              <OrderForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                selectedItems={selectedItems}
              />
            </Box>
          </Grid>
        </Grid>
        {/* Contact Information */}
        <Paper elevation={1} sx={{ mt: 4, p: 3, bgcolor: "grey.50" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Email color="primary" />
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
