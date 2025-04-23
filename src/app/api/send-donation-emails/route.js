import { citiesStrongTransporter } from "@/util/email/nodemailer-transporter";

// English email templates
const donorEmailTemplateEN = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 5px; }
        .header { color: #333; margin-bottom: 20px; }
        .content { margin-bottom: 20px; }
        .footer { font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2 class="header">Thank You for Your Donation!</h2>
        <div class="content">
          <p>Dear ${data.name},</p>
          <p>Thank you for your ${
            data.recurring ? "recurring" : "one-time"
          } donation of $${(data.amount / 100).toFixed(2)} to Cities Strong.</p>
          <p>Your contribution will help revitalize neighborhoods and lift lives.</p>
          <p>Donation Details:</p>
          <ul>
            <li>Name: ${data.name}</li>
            <li>Email: ${data.email}</li>
            <li>Amount: $${(data.amount / 100).toFixed(2)}</li>
            <li>Type: ${data.recurring ? "Monthly" : "One-time"}</li>
          </ul>
        </div>
        <div class="footer">
          <p>This is your donation receipt. Please keep it for your records.</p>
          <p>Contact csffinance@citiesstrong.org for any questions.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const financeEmailTemplateEN = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 5px; }
        .header { color: #333; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2 class="header">New Donation Received</h2>
        <p>A new donation has been processed:</p>
        <ul>
          <li>Name: ${data.name}</li>
          <li>Email: ${data.email}</li>
          <li>Phone: ${data.phone}</li>
          <li>Amount: $${(data.amount / 100).toFixed(2)}</li>
          <li>Type: ${data.recurring ? "Monthly" : "One-time"}</li>
          <li>Language: ${data.language === "sp" ? "Spanish" : "English"}</li>
        </ul>
      </div>
    </body>
    </html>
  `;
};

// Spanish email templates
const donorEmailTemplateSP = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 5px; }
        .header { color: #333; margin-bottom: 20px; }
        .content { margin-bottom: 20px; }
        .footer { font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2 class="header">¡Gracias por su Donación!</h2>
        <div class="content">
          <p>Estimado/a ${data.name},</p>
          <p>Gracias por su donación ${
            data.recurring ? "recurrente" : "única"
          } de $${(data.amount / 100).toFixed(2)} a Cities Strong.</p>
          <p>Su contribución ayudará a revitalizar vecindarios y mejorar vidas.</p>
          <p>Detalles de la donación:</p>
          <ul>
            <li>Nombre: ${data.name}</li>
            <li>Correo electrónico: ${data.email}</li>
            <li>Cantidad: $${(data.amount / 100).toFixed(2)}</li>
            <li>Tipo: ${data.recurring ? "Mensual" : "Única"}</li>
          </ul>
        </div>
        <div class="footer">
          <p>Este es su recibo de donación. Por favor guárdelo para sus registros.</p>
          <p>Contacte a csffinance@citiesstrong.org para cualquier pregunta.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const financeEmailTemplateSP = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 5px; }
        .header { color: #333; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2 class="header">Nueva Donación Recibida</h2>
        <p>Se ha procesado una nueva donación:</p>
        <ul>
          <li>Nombre: ${data.name}</li>
          <li>Correo electrónico: ${data.email}</li>
          <li>Teléfono: ${data.phone}</li>
          <li>Cantidad: $${(data.amount / 100).toFixed(2)}</li>
          <li>Tipo: ${data.recurring ? "Mensual" : "Única"}</li>
          <li>Idioma: Español</li>
        </ul>
      </div>
    </body>
    </html>
  `;
};

// Helper function to select template based on language
const getDonorEmailTemplate = (data) => {
  return data.language === "sp"
    ? donorEmailTemplateSP(data)
    : donorEmailTemplateEN(data);
};

const getFinanceEmailTemplate = (data) => {
  return data.language === "sp"
    ? financeEmailTemplateSP(data)
    : financeEmailTemplateEN(data);
};

export async function POST(request) {
  const data = await request.json();

  // Default language to English if not specified
  if (!data.language) {
    data.language = "en";
  }

  try {
    // Send email to donor
    await citiesStrongTransporter.sendMail({
      to: data.email,
      subject:
        data.language === "sp"
          ? "Recibo de Donación de Cities Strong"
          : "Cities Strong Donation Receipt",
      html: getDonorEmailTemplate(data),
    });

    // Send email to finance team
    await citiesStrongTransporter.sendMail({
      to: "csffinance@citiesstrong.org",
      subject:
        data.language === "sp"
          ? "Notificación de Nueva Donación"
          : "New Donation Notification",
      html: getFinanceEmailTemplate(data),
    });

    return new Response(
      JSON.stringify({ message: "Emails sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Error sending emails", error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
