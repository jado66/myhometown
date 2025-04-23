"use client";
import React, { useState } from "react";
import {
  Typography,
  Grid,
  Box,
  Divider,
  Alert,
  TextField,
  Button,
} from "@mui/material";

import Link from "next/link";

// Import Stripe
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ChevronLeft } from "@mui/icons-material";

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIP_PUBLIC_KEY);

export const DonationForm = ({ amountOptions, spanish, isMd }) => {
  const elementsOptions = {
    locale: spanish ? "es" : "en",
  };

  return (
    <Box sx={{ mx: "auto", width: "100%", maxWidth: "600px" }}>
      <Elements stripe={stripePromise} options={elementsOptions}>
        <Form amountOptions={amountOptions} spanish={spanish} isMd={isMd} />
      </Elements>
    </Box>
  );
};

// Donation Form Component
const Form = ({ amountOptions, spanish, isMd }) => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentType, setPaymentType] = useState("one-time");
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    zipCode: "",
  });

  const stripe = useStripe();
  const elements = useElements();

  // Add form validation
  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Valid email is required";
    if (!formData.phone.match(/^\d{10}$/))
      return "Valid 10-digit phone number is required";
    if (!formData.zipCode.match(/^\d{5}$/))
      return "Valid 5-digit ZIP code is required";
    return null;
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    if (amount !== "custom") setCustomAmount("");
    setPaymentError("");
  };

  const handleCustomAmountChange = (e) => {
    const value = Math.max(1, Number.parseInt(e.target.value) || "");
    setCustomAmount(value);
  };

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPaymentError("");
  };

  const handleContinue = (event) => {
    event.preventDefault();
    const donationAmount =
      selectedAmount === "custom" ? customAmount : selectedAmount;

    if (!donationAmount || donationAmount < 1) {
      setPaymentError(
        spanish
          ? "Por favor, selecciona un monto de donación válido"
          : "Please select a valid donation amount"
      );
      return;
    }

    setShowPersonalInfo(true);
    setPaymentError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const validationError = validateForm();
    if (validationError) {
      setPaymentError(validationError);
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      const donationAmount =
        selectedAmount === "custom" ? customAmount : selectedAmount;

      // Create payment intent on the server
      const paymentResponse = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: donationAmount * 100,
          currency: "usd",
          recurring: paymentType === "recurring",
          metadata: {
            donor_name: formData.name,
            donor_email: formData.email,
            donor_phone: formData.phone,
            donation_destination: spanish ? "Rancho Donations" : "General Fund",
          },

          language: spanish ? "es" : "en",
        }),
      });

      if (!paymentResponse.ok) throw new Error("Payment initialization failed");

      const { clientSecret } = await paymentResponse.json();

      const cardElement = elements.getElement(CardElement);
      const paymentMethodReq = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: { postal_code: formData.zipCode },
        },
      });

      if (paymentMethodReq.error) {
        throw new Error(paymentMethodReq.error.message);
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodReq.paymentMethod.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Send emails after successful payment
      const emailResponse = await fetch("/api/send-donation-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          amount: donationAmount * 100,
          recurring: paymentType === "recurring",
          language: spanish ? "sp" : "en",
        }),
      });

      if (!emailResponse.ok) {
        console.error("Email sending failed but payment was successful");
      }

      setPaymentSuccess(true);
    } catch (error) {
      setPaymentError(error.message || "Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: 'roboto, "Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
    hidePostalCode: true, // We're collecting ZIP separately
  };

  const isLargeAmount = selectedAmount === "custom" && customAmount > 1000;

  if (paymentSuccess) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          px: 3,
          maxWidth: 500,
          mx: "auto",
          border: "1px solid",
          borderColor: "success.light",
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "success.light",
          bgcolor: "rgba(46, 125, 50, 0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              bgcolor: "success.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              mb: 2,
            }}
          >
            <Box component="span" sx={{ fontSize: 40 }}>
              ✓
            </Box>
          </Box>
        </Box>

        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "success.dark",
          }}
        >
          {spanish
            ? "¡Gracias por tu donación!"
            : "Thank You For Your Donation!"}
        </Typography>

        <Typography variant="h6" gutterBottom>
          {paymentType === "recurring"
            ? "Your recurring contribution will help make our communities stronger."
            : spanish
            ? "Tu contribución ayudará a fortalecer nuestras comunidades."
            : "Your contribution will help make our communities stronger."}
        </Typography>

        <Typography sx={{ mb: 3, color: "text.secondary" }}>
          {spanish
            ? "Se ha enviado un recibo a tu dirección de correo electrónico."
            : "A receipt has been sent to your email address."}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
          <Box
            component="button"
            onClick={() => {
              setPaymentSuccess(false);
              setSelectedAmount(null);
              setCustomAmount("");
              setPaymentType("one-time");
              setShowPersonalInfo(false);
              setFormData({ name: "", email: "", phone: "", zipCode: "" });
            }}
            sx={{
              px: 3,
              py: 1.5,
              bgcolor: "white",
              color: "success.main",
              border: "1px solid",
              borderColor: "success.main",
              borderRadius: 1,
              fontSize: "16px",
              fontWeight: "medium",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "success.light",
              },
            }}
          >
            {spanish ? "Hacer otra donación" : "Make Another Donation"}
          </Box>
        </Box>
      </Box>
    );
  }

  if (showPersonalInfo) {
    return (
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 450,
          mx: "auto",
          position: "relative",
          p: 3,
          borderRadius: 2,
          border: "1px solid",
        }}
      >
        <Button
          onClick={() => setShowPersonalInfo(false)}
          sx={{
            color: "text.secondary",
            fontSize: "14px",
            fontWeight: "medium",
            textAlign: "left",
            mb: 2,
            position: "absolute",
          }}
        >
          <ChevronLeft sx={{ ml: 1 }} /> {isMd && (spanish ? "Atrás" : "Back")}
        </Button>

        <Typography
          variant="h5"
          component="h3"
          gutterBottom
          align="center"
          fontWeight="bold"
        >
          {spanish ? "Tu Información" : "Your Information"}
        </Typography>

        <TextField
          fullWidth
          label={spanish ? "Nombre Completo" : "Full Name"}
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label={spanish ? "Correo Electrónico" : "Email"}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label={spanish ? "Número de Teléfono" : "Phone Number"}
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          sx={{ mb: 2 }}
        />
        {/* Zip Code */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label={spanish ? "Código Postal" : "Billing Zip Code"}
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            required
          />
        </Box>

        {/* Summary */}
        <Box>
          <Typography sx={{ fontWeight: "bold" }}>
            {spanish ? "Estás donando" : "You are donating"}{" "}
            {selectedAmount === "custom"
              ? `$${customAmount}`
              : `$${selectedAmount}`}
            {paymentType === "recurring" ? " monthly" : ""}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Card Element */}
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            {spanish ? "Tarjeta de Crédito" : "Card Details"}
          </Typography>
          <Box
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: 1,
            }}
          >
            <CardElement options={cardElementOptions} />
          </Box>
        </Box>

        {/* Error Message */}
        {paymentError && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error">{paymentError}</Alert>
          </Box>
        )}

        <Box
          component="button"
          type="submit"
          disabled={!stripe || isProcessing}
          sx={{
            width: "100%",
            p: 1.5,
            bgcolor: "primary.main",
            color: "white",
            border: "none",
            borderRadius: 1,
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "&:disabled": {
              bgcolor: "grey.400",
              cursor: "not-allowed",
            },
          }}
        >
          {isProcessing
            ? spanish
              ? "Procesando..."
              : "Processing..."
            : spanish
            ? "Donar"
            : "Donate"}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleContinue}
      sx={{
        width: "100%",
        maxWidth: 450,
        mx: "auto",
        p: 3,
        borderRadius: 2,
        border: "1px solid",
      }}
    >
      <Typography
        variant="h5"
        component="h3"
        gutterBottom
        align="center"
        fontWeight="bold"
      >
        {spanish ? "Apoya Nuestra Causa" : "Support Our Cause"}
      </Typography>

      {/* Amount Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>
          {spanish
            ? "Selecciona el Monto de la Donación"
            : "Select Donation Amount"}
        </Typography>
        <Grid container spacing={1}>
          {amountOptions.map((option) => (
            <Grid item xs={4} key={option.value}>
              <Box
                onClick={() => handleAmountSelect(option.value)}
                sx={{
                  p: 1.5,
                  textAlign: "center",
                  border: "1px solid",
                  borderColor:
                    selectedAmount === option.value
                      ? "primary.main"
                      : "grey.300",
                  borderRadius: 1,
                  color:
                    selectedAmount === option.value
                      ? "#188d4e"
                      : "text.primary",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                {option.label}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Custom Amount Input */}
      {selectedAmount === "custom" && (
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            {spanish ? "Monto Personalizado " : "Custom Amount "} ($)
          </Typography>
          <Box
            component="input"
            type="number"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder={spanish ? "Ingresar monto" : "Enter amount"}
            min="1"
            sx={{
              width: "100%",
              p: 1.5,
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: 1,
              fontSize: "16px",
              "&:focus": {
                color: "#188d4e",
                borderColor: "primary.main",
                outline: "none",
              },
            }}
          />
        </Box>
      )}

      {/* Large Amount Message */}
      {isLargeAmount && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="info">
            For donations over $1000, please contact{" "}
            <Link href="mailto:csffinance@citiesstrong.org">
              csffinance@citiesstrong.org
            </Link>
          </Alert>
        </Box>
      )}

      {/* Error Message */}
      {paymentError && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{paymentError}</Alert>
        </Box>
      )}

      {/* Continue Button */}
      <Box
        component="button"
        type="submit"
        disabled={isProcessing || isLargeAmount}
        sx={{
          width: "100%",
          p: 1.5,
          bgcolor: "primary.main",
          color: "white",
          border: "none",
          borderRadius: 1,
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          "&:hover": {
            bgcolor: "primary.dark",
          },
          "&:disabled": {
            bgcolor: "grey.400",
            cursor: "not-allowed",
          },
        }}
      >
        {isProcessing
          ? "Processing..."
          : paymentType === "recurring"
          ? "Continue Monthly Donation"
          : spanish
          ? "Continuar"
          : "Continue"}
      </Box>
    </Box>
  );
};
