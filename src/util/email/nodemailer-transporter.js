import nodemailer from "nodemailer";

export const citiesStrongTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.CS_GMAIL_USER,
    clientId: process.env.CS_GMAIL_CLIENT_ID,
    clientSecret: process.env.CS_GMAIL_CLIENT_SECRET,
    refreshToken: process.env.CS_GMAIL_REFRESH_TOKEN,
  },
});

export const myHometownTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.MHT_GMAIL_USER,
    clientId: process.env.MHT_GMAIL_CLIENT_ID,
    clientSecret: process.env.MHT_GMAIL_CLIENT_SECRET,
    refreshToken: process.env.MHT_GMAIL_REFRESH_TOKEN,
  },
});
