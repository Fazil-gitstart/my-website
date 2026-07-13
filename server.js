require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// ================================
// CONFIGURATION
// ================================

const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const DR_RAHIL = process.env.DR_RAHIL;
const DR_ROUSHNI = process.env.DR_ROUSHNI;

// ================================
// SEND WHATSAPP MESSAGE FUNCTION
// ================================

async function sendWhatsAppMessage(to, message) {
    const url = `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`;

    return axios.post(
        url,
        {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "text",
            text: {
                preview_url: false,
                body: message
            }
        },
        {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );
}

// ================================
// APPOINTMENT API
// ================================

app.post("/api/book-appointment", async (req, res) => {
    try {

        const {
            patientName,
            phone,
            doctor,
            date,
            time
        } = req.body;

        if (
            !patientName ||
            !phone ||
            !doctor ||
            !date ||
            !time
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const whatsappMessage = `
🏥 SHAZLIN CLINIC

📅 NEW APPOINTMENT

Patient Name : ${patientName}
Phone        : ${phone}
Doctor       : ${doctor}
Date         : ${date}
Time         : ${time}

Appointment booked successfully.
`;

        await Promise.all([
            sendWhatsAppMessage(DR_RAHIL, whatsappMessage),
            sendWhatsAppMessage(DR_ROUSHNI, whatsappMessage)
        ]);

        return res.status(200).json({
            success: true,
            message: "Appointment booked successfully."
        });

    } catch (error) {

        console.error(
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to send WhatsApp notification."
        });
    }
});

// ================================
// HEALTH CHECK
// ================================

app.get("/", (req, res) => {
    res.send("SHAZLIN Clinic Backend Running");
});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
