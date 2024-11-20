import { citiesStrongTransporter } from "@/util/email/nodemailer-transporter";

const formattedHtml = (html) => {
  return `
    <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Application</title>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
      }
      .label {
        font-weight: bold;
        margin-bottom: 5px;
        display: block;
      }
      .input {
        margin-bottom: 15px;
      }
      textarea {
        width: 100%;
        height: 100px;
        resize: none;
      }
      h4 {
        color: #333;
      }
    </style>
  </head>
    <body>
     <div class="col-md-7 col-lg-8">
        <h4 class="mb-3">You have a request from CitiesStrong website from</h4>
        <div class="row g-3">
          <div class="col-sm-6">
            <label for="firstName" class="form-label">
              First name
            </label>
            <input
              type="text"
              class="form-control"
              id="firstName"
              readonly
              value="${html.firstName}"
            />
          </div>

          <div class="col-sm-6">
            <label for="lastName" class="form-label">
              Last name
            </label>
            <input
              type="text"
              class="form-control"
              id="lastName"
              readonly
              value="${html.lastName}"
            />
          </div>

          <div class="col-12">
            <label for="username" class="form-label">
              Email
            </label>
            <div class="input-group has-validation">
              <input
                type="text"
                class="form-control"
                id="email"
                readonly
                value="${html.email}"
              />
            </div>
          </div>

          <hr class="my-4" />

          <div class="col-12">
            <label for="username" class="form-label">
              Message
            </label>
            <div class="input-group has-validation">
              <textarea readonly>${html.message}</textarea>
            </div>
          </div>
        </div>
      </div>
</body>
</html>
  `;
};

export async function POST(request, res) {
  const { subject, html } = await request.json();

  try {
    // Send mail with defined transport object
    let info = await citiesStrongTransporter.sendMail({
      to: "info@citiesstrong.org", // list of receivers
      subject, // Subject line
      html: formattedHtml(html), // html body
    });

    console.log("Message sent: %s", info.messageId);

    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
    // Send a JSON response with status code 500 (Internal Server Error) if an error occurs
    return new Response(
      JSON.stringify({ message: "Error sending email", error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
