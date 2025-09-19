"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Add, Email, Person, Phone } from "@mui/icons-material";
import {
  promotionalItems,
  myHometownItems,
  type CatalogItem,
} from "./catalogData";
import { ItemDialog } from "./ItemDialog";
import { ShoppingCart, type DesignCartItem } from "./ShoppingCart";
import { OrderForm } from "./OrderForm";

// Carousel and LightBox imports
import CarouselComponent from "@/components/ui/DesignHubCarousel";
import { LightBox } from "@/components/LightBox";

// Example images for each tab
const flyersExamples = [
  "/design-hub/Classes Flyer.webp",
  "/design-hub/ComingSoon-Span.webp",
  "/design-hub/Door Hanger.webp",
  "/design-hub/Flyer Children.webp",
  "/design-hub/Flyer Classes 2.webp",
  "/design-hub/Grand opening Flyer.webp",
];
const certificatesExamples = [
  "/design-hub/Certificate.jpeg",
  "/design-hub/Certificate.jpeg",
  "/design-hub/Certificate.jpeg",
];
const signsBannersExamples = [
  "/design-hub/Banner 1.jpeg",
  "/design-hub/Banner 2.jpeg",
  "/design-hub/Yard Sign.jpeg",
];

interface CartItem {
  id: string;
  itemTitle: string;
  itemType: string;
  purpose: string;
  theme: string;
  dueDate: string;
  englishText: string;
  spanishText: string;
  qrCodes?: string;
  size: string;
  otherSize?: string;
}

// Promotional items are now boolean (single order per catalog item)

export default function DesignHub() {
  // Renders promotional catalog items as cards
  const renderPromotionalItems = (items: CatalogItem[]) => (
    <>
      <Box sx={{ px: 3, pt: 2, pb: 1, mb: 3, bgcolor: "grey.50" }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          Co-Branded Promotional Materials
        </Typography>
        <Typography variant="body2" color="text.secondary">
          These promotional material designs feature both your community&apos;s
          branding and the myHometown logo.
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, fontWeight: "bold" }}
        >
          Please ensure to include your city or community name in the Location
          Type dropdown along with your order.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {items.map((item) => {
          const alreadyAdded = promotionalCartItems.some(
            (i) => i.id === item.id
          );
          return (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    bgcolor: "white",
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  <Box
                    component="img"
                    src={item.image || "/placeholderWhite.svg"}
                    alt={item.title}
                    sx={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {item.description}
                  </Typography>
                  <Button
                    variant={alreadyAdded ? "outlined" : "contained"}
                    startIcon={!alreadyAdded ? <Add /> : undefined}
                    onClick={() =>
                      !alreadyAdded && handleAddPromotionalItem(item)
                    }
                    disabled={alreadyAdded}
                    fullWidth
                  >
                    {alreadyAdded ? "Added" : "Add to Cart"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );

  // Renders myHometown catalog items as cards (disabled)
  const renderMyHometownItems = (items: CatalogItem[]) => (
    <Box>
      <Box sx={{ px: 3, pt: 2, pb: 1, bgcolor: "grey.50" }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          myHometown Promotional Materials
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          These promotional materials are pre-designed with the myHometown logo
          and can be ordered by contacting our preferred vendor,{" "}
          <strong>Brand Makers</strong>. Below is a sampling of items you can
          order. Contact Brand Makers directly for a full list.
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Email />}
            href="mailto:katie@brandmakers.com?subject=myHometown Swag Order&body=Hi Katie,%0D%0A%0D%0AI would like to put in an order for some myHometown swag.%0D%0A%0D%0AI'd like to order the following:"
            sx={{ mb: 2 }}
          >
            Contact for Order
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  bgcolor: "white",
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Box
                  component="img"
                  src={item.image || "/placeholderWhite.svg"}
                  alt={item.title}
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
  const [activeTab, setActiveTab] = useState(-1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: "flyers" | "certificates" | "signs-banners";
    title: string;
  } | null>(null);
  const [cartItems, setCartItems] = useState<DesignCartItem[]>([]);
  const [promotionalCartItems, setPromotionalCartItems] = useState<
    CatalogItem[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For LightBox
  const [lightBoxImage, setLightBoxImage] = useState<string | null>(null);
  const handleExampleImageClick = (imgSrc: string) => setLightBoxImage(imgSrc);
  const closeImageDialog = () => setLightBoxImage(null);

  // Cart and dialog logic
  const handleDialogSubmit = (data: any) => {
    const newItem: DesignCartItem = {
      id: Date.now().toString(),
      ...data,
    };
    setCartItems((prev) => [...prev, newItem]);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddPromotionalItem = (item: CatalogItem) => {
    setPromotionalCartItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev; // already added
      return [...prev, item];
    });
  };

  const handleRemovePromotionalItem = (itemId: string) => {
    setPromotionalCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleOrderSubmit = async (orderData: any) => {
    setIsSubmitting(true);

    try {
      // Prepare location string based on type
      let locationString = orderData.locationType;
      if (orderData.locationType === "city" && orderData.cityLabel) {
        locationString = `City: ${orderData.cityLabel}`;
      } else if (
        orderData.locationType === "community" &&
        orderData.communityLabel
      ) {
        locationString = `Community: ${orderData.communityLabel}`;
      }

      const randomThreeDigitID =
        Math.floor(100 + Math.random() * 900) +
        "-" +
        Math.floor(100 + Math.random() * 900); // Two random 3-digit numbers with hyphen

      const emailData = {
        subject: `MHT Design Hub Order Request ID:${randomThreeDigitID}`,
        html: {
          authorizedBy: orderData.authorizationType
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase()),
          id: randomThreeDigitID,
          firstName: orderData.name.split(" ")[0] || orderData.name,
          lastName: orderData.name.split(" ").slice(1).join(" ") || "",
          email: orderData.email,
          phone: orderData.phone,
          location: locationString,
          designItems: cartItems,
          promotionalItems: promotionalCartItems,
          additionalRequests: orderData.additionalRequests || "None",
          submittedAt: new Date().toLocaleString(),
        },
      };

      // Send to API
      const response = await fetch(
        "/api/communications/send-mail/to-design-hub",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Order submitted successfully:", result);

      // Reset carts after successful submission
      setCartItems([]);
      setPromotionalCartItems([]);

      alert(
        "Order submitted successfully! You will receive confirmation within 24 hours."
      );
    } catch (error) {
      console.error("Error submitting order:", error);
      alert(
        "There was an error submitting your order. Please try again or contact support."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = (type: "flyers" | "certificates" | "signs-banners") => {
    const categoryName =
      type === "flyers"
        ? "Flyer"
        : type === "certificates"
        ? "Certificate"
        : "Sign/Banner";
    setSelectedItem({ type, title: categoryName });
    setDialogOpen(true);
  };

  // ...existing handlers...

  const renderSingleAddButton = (
    type: "flyers" | "certificates" | "signs-banners",
    title: string,
    description: string
  ) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mt: 5,
      }}
    >
      <Button
        variant="contained"
        size="large"
        startIcon={<Add />}
        onClick={() => handleAddItem(type)}
        sx={{
          py: 2,
          px: 4,
          fontSize: "1.2rem",
          minWidth: "200px",
        }}
      >
        Add {title}
      </Button>
    </Box>
  );

  const hasItems = cartItems.length > 0 || promotionalCartItems.length > 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* LightBox for example images */}
      <LightBox image={lightBoxImage} closeImageDialog={closeImageDialog} />

      {/* Header Section with placeholder image */}
      <Box sx={{ p: 4, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6} sx={{ px: 3 }}>
            <Box
              component="img"
              src="/design-hub/placeholder.png"
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
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold", mt: 3, mb: 0 }}
            >
              MHT Design Hub
            </Typography>

            <Typography variant="h5">
              Order designs that are ready to print!
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: "800px", mx: "auto", mt: 3 }}
            >
              MyHometown and the Brigham Young Design Department have a
              partnership where they will design your marketing and design
              materials for your city or community needs.
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: "800px", mx: "auto", mt: 2 }}
            >
              When your design is created, you will receive a digital template
              for printing or production, via email.
            </Typography>

            <Typography
              variant="body1"
              color="error"
              sx={{ maxWidth: "800px", fontWeight: "bold", mx: "auto", mt: 2 }}
            >
              Note: This design service is independently funded; therefore,
              there is no cost to your city/community. The cost of printing or
              purchasing promotional materials is the responsibility of your
              city/community.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 0 }}>
            <Box sx={{ px: 3, pt: 3, pb: 1 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Custom Design Services
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create personalized materials for your community
              </Typography>
            </Box>

            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="Flyers" />
              <Tab label="Certificates" />
              <Tab label="Signs & Banners" />
              <Tab label="Co-Branded Promotional Materials" />
              <Tab label="myHometown Promotional Materials" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Carousel for first three tabs */}

              {activeTab === -1 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                    Select a category to get started
                  </Typography>
                  <Typography>
                    Please choose a design category above to view examples and
                    start your order.
                  </Typography>
                </Box>
              )}

              {activeTab === 0 && (
                <>
                  <Box sx={{ px: 3, pt: 2, pb: 1, bgcolor: "grey.50" }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Flyers
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Create custom flyers for your community events and
                      announcements
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", textAlign: "center", mt: 3 }}
                  >
                    Click to enlarge
                  </Typography>
                  <CarouselComponent
                    images={flyersExamples}
                    speed={700}
                    onImageClick={handleExampleImageClick}
                    isEdit={false}
                    addCarouselImage={() => {}}
                    editCarouselImage={() => {}}
                    removeCarouselImage={() => {}}
                    noDots
                    height={350}
                  />
                  {/* Click to enlarge image helper text*/}

                  {renderSingleAddButton(
                    "flyers",
                    "Flyer",
                    "Create custom flyers for your community events and announcements"
                  )}
                </>
              )}
              {activeTab === 1 && (
                <>
                  <Box sx={{ px: 3, pt: 2, pb: 1, bgcolor: "grey.50" }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Certificates
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Design certificates for volunteers, achievements, and
                      recognitions
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", textAlign: "center", mt: 3 }}
                  >
                    Click to enlarge
                  </Typography>
                  <CarouselComponent
                    images={certificatesExamples}
                    speed={700}
                    onImageClick={handleExampleImageClick}
                    isEdit={false}
                    addCarouselImage={() => {}}
                    editCarouselImage={() => {}}
                    removeCarouselImage={() => {}}
                    noDots
                    height={150}
                  />

                  {renderSingleAddButton(
                    "certificates",
                    "Certificate",
                    "Design certificates for volunteers, achievements, and recognitions"
                  )}
                </>
              )}
              {activeTab === 2 && (
                <>
                  <Box sx={{ px: 3, pt: 2, pb: 1, bgcolor: "grey.50" }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Signs &amp; Banners
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Order custom designs for your city or community needs.
                      Signs and banners must have the MHT logo and can be
                      co-branded with your community or city logo.
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", textAlign: "center", mt: 3 }}
                  >
                    Click to enlarge
                  </Typography>
                  <CarouselComponent
                    images={signsBannersExamples}
                    speed={700}
                    onImageClick={handleExampleImageClick}
                    isEdit={false}
                    addCarouselImage={() => {}}
                    editCarouselImage={() => {}}
                    removeCarouselImage={() => {}}
                    noDots
                    height={180}
                  />

                  {renderSingleAddButton(
                    "signs-banners",
                    "Sign/Banner",
                    "Order custom designs for signs and banners"
                  )}
                </>
              )}
              {activeTab === 3 && renderPromotionalItems(promotionalItems)}
              {activeTab === 4 && renderMyHometownItems(myHometownItems)}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Box sx={{ position: "sticky", top: 20, space: 2 }}>
            <ShoppingCart
              designItems={cartItems}
              promotionalItems={promotionalCartItems}
              onRemoveDesignItem={handleRemoveCartItem}
              onRemovePromotionalItem={handleRemovePromotionalItem}
            />
            <Box sx={{ mt: 3 }}>
              <OrderForm
                onSubmit={handleOrderSubmit}
                isSubmitting={isSubmitting}
                hasItems={hasItems}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {selectedItem && (
        <ItemDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          itemType={selectedItem.type}
          itemTitle={selectedItem.title}
          onSubmit={handleDialogSubmit}
        />
      )}
    </Container>
  );
}
