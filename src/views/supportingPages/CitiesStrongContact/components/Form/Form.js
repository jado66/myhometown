/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/system";
import { toast } from "react-toastify";
import useSendRequestForm from "@/hooks/useSendRequestForm";

const Form = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  const { loading, error, success, sendRequestFormByEmail } =
    useSendRequestForm();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    if (success) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
      });
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // You can add form validation and submission logic here

    await sendRequestFormByEmail(formData);
  };

  return (
    <Box sx={{ px: { xs: 4, md: 0 } }}>
      <Box>
        <Box marginBottom={2}>
          <Typography
            sx={{
              textTransform: "uppercase",
              fontWeight: "medium",
            }}
            gutterBottom
          >
            Contact us
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
            }}
          >
            Send us a message
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6">
            We'll get back to you in 1 - STRENGTH THROUGH SERVICE2 business
            days.
          </Typography>
        </Box>
      </Box>
      <Box padding={0} width={"100%"} my={4}>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={isMd ? 4 : 2}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                sx={{ height: 54, backgroundColor: "white" }}
                label="First name"
                variant="outlined"
                color="primary"
                size="medium"
                fullWidth
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                sx={{ height: 54, backgroundColor: "white" }}
                label="Last name"
                variant="outlined"
                color="primary"
                size="medium"
                fullWidth
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                sx={{
                  height: 54,
                  backgroundColor: "white",
                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "black !important",
                  },
                  "& .MuiOutlinedInput-input::-webkit-input-placeholder": {
                    color: "black !important",
                  },
                }}
                label="Email"
                type="email"
                variant="outlined"
                color="primary"
                size="medium"
                fullWidth
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                label="Message"
                multiline
                sx={{ backgroundColor: "white" }}
                rows={6}
                variant="outlined"
                color="primary"
                size="medium"
                fullWidth
                name="message"
                value={formData.message}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                sx={{
                  height: 54,
                  textTransform: "uppercase",
                  fontSize: "large",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#33b56f",
                  },
                }}
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                type="submit"
                loading={loading}
                disabled={
                  loading ||
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.email ||
                  !formData.message
                }
              >
                Send Message
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography component="p" variant="body2" align="left">
                  By clicking on "Send Message" you agree to our{" "}
                  <Box
                    component="a"
                    href=""
                    color={theme.palette.text.primary}
                    fontWeight={"700"}
                  >
                    Privacy Policy
                  </Box>
                  ,{" "}
                  <Box
                    component="a"
                    href=""
                    color={theme.palette.text.primary}
                    fontWeight={"700"}
                  >
                    Data Policy
                  </Box>{" "}
                  and{" "}
                  <Box
                    component="a"
                    href=""
                    color={theme.palette.text.primary}
                    fontWeight={"700"}
                  >
                    Cookie Policy
                  </Box>
                  .
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default Form;

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: "0px",
    borderWidth: "2px",
    borderColor: "black",
    fontWeight: "bold",
    textTransform: "capitalize",
    color: "black",
  },
  "& .MuiInputLabel-root": {
    color: "grey",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "black",
      borderWidth: "2px", // Set your desired border width here
    },
    "&:hover fieldset": {
      borderColor: "black",
      borderWidth: "2px", // Set your desired border width here
    },
    "&.Mui-focused fieldset": {
      borderColor: "black",
      borderWidth: "2px", // Set your desired border width here
    },
  },
  "& .MuiOutlinedInput-input": {
    color: "black",
  },
}));
