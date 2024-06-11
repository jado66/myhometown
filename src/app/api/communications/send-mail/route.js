// pages/api/send.js

import sendEmail from "@/util/communication/sendMail";

export async function POST(req, res) {
    const { to, subject, message } = await req.json();
  
    try {
        await sendEmail(to, subject, message);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}