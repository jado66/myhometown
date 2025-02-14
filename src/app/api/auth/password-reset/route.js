import { myHometownTransporter } from "@/util/email/nodemailer-transporter";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
);

const formattedHtml = (email, resetLink) => {
  // const logoBase64 = `PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMzAwIDIwMCI+PHBhdGggZD0iTS0uMzMsODkuNDJ2LTE0LjI5aDM0LjY3bC45NywxMS42MWMyLjgxLTQuMjIsNi4zNC03LjQ4LDEwLjU5LTkuNzgsNC4yNS0yLjMsOS4xNi0zLjQ1LDE0Ljc0LTMuNDVzMTAuNDUsMS4yNCwxNC40NSwzLjc0YzQuMDEsMi40OSw3LjA0LDYuMjUsOS4wOSwxMS4yOCwyLjcxLTQuNzEsNi4yMi04LjM5LDEwLjU1LTExLjA0LDQuMzMtMi42NSw5LjQyLTMuOTgsMTUuMjctMy45OCw4LjY2LDAsMTUuNDksMi45OSwyMC41LDguOTcsNS4wMSw1Ljk4LDcuNTEsMTUuMDksNy41MSwyNy4zMnYzNi41NGwxMS40NSwyLjQzdjE0LjIxaC00NS4zOXYtMTQuMjFsMTAuMjMtMi40M3YtMzYuNjJjMC02LjY2LTEuMDgtMTEuMjktMy4yNS0xMy44OS0yLjE3LTIuNi01LjM5LTMuOS05LjY2LTMuOS0zLjM1LDAtNi4yNy43NS04LjczLDIuMjMtMi40NywxLjQ5LTQuNDMsMy41Ni01Ljg5LDYuMjEsMCwxLjAzLjAzLDEuOTEuMDgsMi42NC4wNS43My4wOCwxLjQ3LjA4LDIuMjN2NDEuMDhsOS41OCwyLjQzdjE0LjIxaC00Mi43OXYtMTQuMjFsOS41OC0yLjQzdi0zNi42MmMwLTYuNS0xLjA4LTExLjA4LTMuMjUtMTMuNzZzLTUuNDEtNC4wMi05Ljc0LTQuMDJjLTMuMTksMC02LC42MS04LjQsMS44My0yLjQxLDEuMjItNC40LDIuOTQtNS45Nyw1LjE1djQ3LjQybDEwLjIzLDIuNDN2MTQuMjFILjg5di0xNC4yMWwxMS40NS0yLjQzdi01NC40OGwtMTIuNjctMi40NFoiIGZpbGw9IiMwMDAiIHN0cm9rZS13aWR0aD0iMCIvPjxwYXRoIGQ9Ik0yNDMuNCw4OS40MmwtOC4yLDEuMjItMzIuMzEsODUuNDljLTIuNTUsNi4zMy01Ljk0LDExLjYzLTEwLjE5LDE1LjkxLTQuMjUsNC4yNy0xMC42NSw2LjQxLTE5LjIsNi40MS0yLDAtMy44OC0uMTYtNS42NC0uNDktMS43Ni0uMzItMy44My0uNzgtNi4yMS0xLjM4bDIuNzYtMTcuMjljLjc2LjExLDEuNTQuMjIsMi4zNS4zMy44MS4xMSwxLjUxLjE2LDIuMTEuMTYsMy45NSwwLDYuOTgtLjk2LDkuMDktMi44OCwyLjExLTEuOTIsMy43NC00LjMyLDQuODctNy4xOGwyLjY4LTYuNjYtMjcuODUtNzIuMzQtOC4yLTEuM3YtMTQuMjloNDMuMDN2MTQuMjlsLTkuODMsMS42MiwxMi4wMiwzNS4wOCwxLjIyLDYuMzMuNDkuMDgsMTMuODktNDEuNDktOS45MS0xLjYydi0xNC4yOWg0My4wM3YxNC4yOVoiIGZpbGw9IiMwMDAiIHN0cm9rZS13aWR0aD0iMCIvPjxwb2x5Z29uIHBvaW50cz0iMjUwLjgzIDU5LjA2IDI1MC44MyA0NC43NyAyOTkuNzkgNDQuNzcgMjk5Ljc5IDU5LjA2IDI4Ny4xMiA2MS41IDI4Ny4xMiA5NS41OSAzMzUuMzUgOTUuNTkgMzM1LjM1IDYxLjUgMzIyLjY5IDU5LjA2IDMyMi42OSA0NC43NyAzMzUuMzUgNDQuNzcgMzU4Ljk4IDQ0Ljc3IDM3MS42NCA0NC43NyAzNzEuNjQgNTkuMDYgMzU4Ljk4IDYxLjUgMzU4Ljk4IDE0Ni4zNCAzNzEuNjQgMTQ4Ljc3IDM3MS42NCAxNjIuOTggMzIyLjY5IDE2Mi45OCAzMjIuNjkgMTQ4Ljc3IDMzNS4zNSAxNDYuMzQgMzM1LjM1IDExMy44NiAyODcuMTIgMTEzLjg2IDI4Ny4xMiAxNDYuMzQgMjk5Ljc5IDE0OC43NyAyOTkuNzkgMTYyLjk4IDI1MC44MyAxNjIuOTggMjUwLjgzIDE0OC43NyAyNjMuNDIgMTQ2LjM0IDI2My40MiA2MS41IDI1MC44MyA1OS4wNiIgZmlsbD0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIwIi8+PHBhdGggZD0iTTQwMS43NywxMTkuOTVjMCw4LjAxLDEuNDEsMTQuNDQsNC4yMiwxOS4yOCwyLjgxLDQuODUsNy4zNiw3LjI3LDEzLjY0LDcuMjdzMTAuNi0yLjQ0LDEzLjQ0LTcuMzFjMi44NC00Ljg3LDQuMjYtMTEuMjksNC4yNi0xOS4yNHYtMS43MWMwLTcuNzktMS40My0xNC4xNS00LjMtMTkuMDgtMi44Ny00LjkyLTcuMzktNy4zOS0xMy41Ni03LjM5cy0xMC42NiwyLjQ2LTEzLjQ4LDcuMzljLTIuODIsNC45Mi00LjIyLDExLjI5LTQuMjIsMTkuMDh2MS43MVpNMzc4LjA2LDExOC4yNWMwLTEzLjEsMy42Ny0yMy44MywxMS0zMi4xOSw3LjMzLTguMzYsMTcuNDctMTIuNTQsMzAuNDEtMTIuNTRzMjMuMTUsNC4xNywzMC40OSwxMi41MWM3LjMzLDguMzMsMTEsMTkuMDgsMTEsMzIuMjN2MS43MWMwLDEzLjIxLTMuNjcsMjMuOTYtMTEsMzIuMjctNy4zNCw4LjMxLTE3LjQ0LDEyLjQ3LTMwLjMzLDEyLjQ3cy0yMy4yMy00LjE1LTMwLjU3LTEyLjQ3Yy03LjMzLTguMzEtMTEtMTkuMDctMTEtMzIuMjd2LTEuNzFaIiBmaWxsPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAiLz48cGF0aCBkPSJNNDcwLjEsODkuNDJ2LTE0LjI5aDM0LjY3bC45NywxMS42MWMyLjgxLTQuMjIsNi4zNC03LjQ4LDEwLjU5LTkuNzgsNC4yNS0yLjMsOS4xNi0zLjQ1LDE0Ljc0LTMuNDVzMTAuNDUsMS4yNCwxNC40NSwzLjc0YzQuMDEsMi40OSw3LjA0LDYuMjUsOS4wOSwxMS4yOCwyLjcxLTQuNzEsNi4yMi04LjM5LDEwLjU1LTExLjA0LDQuMzMtMi42NSw5LjQyLTMuOTgsMTUuMjctMy45OCw4LjY2LDAsMTUuNDksMi45OSwyMC41LDguOTcsNS4wMSw1Ljk4LDcuNTEsMTUuMDksNy41MSwyNy4zMnYzNi41NGwxMS40NSwyLjQzdjE0LjIxaC00NS4zOXYtMTQuMjFsMTAuMjMtMi40M3YtMzYuNjJjMC02LjY2LTEuMDgtMTEuMjktMy4yNS0xMy44OS0yLjE3LTIuNi01LjM5LTMuOS05LjY2LTMuOS0zLjM1LDAtNi4yNy43NS04LjczLDIuMjMtMi40NywxLjQ5LTQuNDMsMy41Ni01Ljg5LDYuMjEsMCwxLjAzLjAzLDEuOTEuMDgsMi42NC4wNS43My4wOCwxLjQ3LjA4LDIuMjN2NDEuMDhsOS41OCwyLjQzdjE0LjIxaC00Mi43OXYtMTQuMjFsOS41OC0yLjQzdi0zNi42MmMwLTYuNS0xLjA4LTExLjA4LTMuMjUtMTMuNzYtMi4xNy0yLjY4LTUuNDEtNC4wMi05Ljc0LTQuMDItMy4xOSwwLTYsLjYxLTguNCwxLjgzLTIuNDEsMS4yMi00LjQsMi45NC01Ljk3LDUuMTV2NDcuNDJsMTAuMjMsMi40M3YxNC4yMWgtNDUuM3YtMTQuMjFsMTEuNDUtMi40M3YtNTQuNDhsLTEyLjY3LTIuNDRaIiBmaWxsPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAiLz48cGF0aCBkPSJNNjYyLjc5LDkxLjc4Yy00LjM4LDAtNy44NSwxLjY4LTEwLjM5LDUuMDMtMi41NCwzLjM2LTQuMTEsNy43Ny00LjcxLDEzLjI0bC4yNC40aDI5LjA3di0yLjExYzAtNS4wMy0xLjE4LTkuMDUtMy41My0xMi4wNi0yLjM2LTMtNS45MS00LjUxLTEwLjY4LTQuNTFNNjY0LjksMTY0LjY5Yy0xMi42NiwwLTIyLjc5LTQuMDYtMzAuMzctMTIuMTgtNy41OC04LjEyLTExLjM3LTE4LjQzLTExLjM3LTMwLjk0di0zLjI1YzAtMTMuMDQsMy41OS0yMy43OSwxMC43Ni0zMi4yMyw3LjE3LTguNDQsMTYuNzktMTIuNjQsMjguODYtMTIuNTgsMTEuODUsMCwyMS4wNiwzLjU3LDI3LjYsMTAuNzIsNi41NSw3LjE0LDkuODIsMTYuODEsOS44MiwyOC45OHYxMi45MWgtNTIuNDVsLS4xNi40OWMuNDQsNS43OSwyLjM3LDEwLjU2LDUuODEsMTQuMjksMy40NCwzLjczLDguMSw1LjYsMTQsNS42LDUuMjUsMCw5LjYxLS41MywxMy4wNy0xLjU4LDMuNDYtMS4wNiw3LjI2LTIuNzIsMTEuMzctNWw2LjQyLDE0LjYyYy0zLjYzLDIuODctOC4zMiw1LjI4LTE0LjA5LDcuMjItNS43NywxLjk1LTEyLjE5LDIuOTItMTkuMjksMi45MiIgZmlsbD0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIwIi8+PHBhdGggZD0iTTc0Ni45MSw1NS45NnYxOS4xOGgxNS40M3YxNi42NGgtMTUuNDN2NDQuNzRjMCwzLjQxLjcsNS44NCwyLjExLDcuMzEsMS40MSwxLjQ2LDMuMywyLjE5LDUuNjksMi4xOSwxLjYyLDAsMy4wNC0uMDcsNC4yNi0uMiwxLjIyLS4xNCwyLjU4LS4zNyw0LjEtLjY5bDIuMDMsMTcuMTNjLTIuNjUuODEtNS4yOCwxLjQyLTcuODcsMS44Mi0yLjYuNDEtNS40MS42MS04LjQ1LjYxLTguMTcsMC0xNC40Ni0yLjI1LTE4Ljg4LTYuNzQtNC40MS00LjQ5LTYuNjItMTEuNjEtNi42Mi0yMS4zNXYtNDQuODJoLTEyLjkxdi0xNi42NGgxMi45MXYtMTkuMThoMjMuNjNaIiBmaWxsPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAiLz48cGF0aCBkPSJNNzk1LjcyLDExOS45NWMwLDguMDEsMS40MSwxNC40NCw0LjIyLDE5LjI4LDIuODEsNC44NSw3LjM2LDcuMjcsMTMuNjQsNy4yN3MxMC42LTIuNDQsMTMuNDQtNy4zMWMyLjg0LTQuODcsNC4yNi0xMS4yOSw0LjI2LTE5LjI0di0xLjcxYzAtNy43OS0xLjQzLTE0LjE1LTQuMy0xOS4wOC0yLjg3LTQuOTItNy4zOS03LjM5LTEzLjU2LTcuMzlzLTEwLjY2LDIuNDYtMTMuNDgsNy4zOWMtMi44Miw0LjkyLTQuMjIsMTEuMjktNC4yMiwxOS4wOHYxLjcxWk03NzIuMDEsMTE4LjI1YzAtMTMuMSwzLjY3LTIzLjgzLDExLTMyLjE5LDcuMzMtOC4zNiwxNy40Ny0xMi41NCwzMC40MS0xMi41NHMyMy4xNSw0LjE3LDMwLjQ5LDEyLjUxYzcuMzMsOC4zMywxMSwxOS4wOCwxMSwzMi4yM3YxLjcxYzAsMTMuMjEtMy42NywyMy45Ni0xMSwzMi4yNy03LjM0LDguMzEtMTcuNDQsMTIuNDctMzAuMzMsMTIuNDdzLTIzLjIzLTQuMTUtMzAuNTctMTIuNDdjLTcuMzMtOC4zMS0xMS0xOS4wNy0xMS0zMi4yN3YtMS43MVoiIGZpbGw9IiMwMDAiIHN0cm9rZS13aWR0aD0iMCIvPjxwb2x5Z29uIHBvaW50cz0iOTg3LjI3IDg5LjQyIDk3OC40MiA5MC41NiA5NjAuMDcgMTYyLjk4IDk0MC4yNiAxNjIuOTggOTIzLjk0IDExMC43IDkyMy40NSAxMTAuNyA5MDcuMTQgMTYyLjk4IDg4Ny40MSAxNjIuOTggODY4Ljk4IDkwLjU2IDg2MC4xMyA4OS40MiA4NjAuMTMgNzUuMTMgODk5LjkxIDc1LjEzIDg5OS45MSA4OS40MiA4OTAuNTcgOTEuMjEgODk4Ljg1IDEzMS40IDg5OS4zNCAxMzEuNCA5MTUuNzQgNzUuMTMgOTMxLjY1IDc1LjEzIDk0OC4yMiAxMzEuNTYgOTQ4LjcxIDEzMS41NiA5NTYuOTEgOTEuMjkgOTQ3LjQ5IDg5LjQyIDk0Ny40OSA3NS4xMyA5ODcuMjcgNzUuMTMgOTg3LjI3IDg5LjQyIiBmaWxsPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAiLz48cGF0aCBkPSJNOTk4Ljk2LDE0OC43N2wxMS4zNy0yLjQzdi01NC40OGwtMTIuNTgtMi40NHYtMTQuMjloMzQuNjdsMS4wNiwxMi41OGMyLjkyLTQuNDksNi41Mi03Ljk5LDEwLjgtMTAuNDcsNC4yNy0yLjQ5LDkuMDYtMy43MywxNC4zNy0zLjczLDguODgsMCwxNS44LDIuNzksMjAuNzksOC4zNiw0Ljk4LDUuNTgsNy40NywxNC4zMiw3LjQ3LDI2LjIydjM4LjI0bDExLjM3LDIuNDN2MTQuMjFoLTQ1LjN2LTE0LjIxbDEwLjE1LTIuNDN2LTM4LjE2YzAtNS45LTEuMTktMTAuMDgtMy41Ny0xMi41NC0yLjM4LTIuNDYtNS45OC0zLjY5LTEwLjgtMy42OS0zLjE0LDAtNS45NS42NC04LjQ0LDEuOTEtMi40OSwxLjI3LTQuNTcsMy4wNy02LjI1LDUuNHY0Ny4wOWw5LjU4LDIuNDN2MTQuMjFoLTQ0LjY1di0xNC4yMVoiIGZpbGw9IiMwMDAiIHN0cm9rZS13aWR0aD0iMCIvPjxwYXRoIGQ9Ik0xMjQ5LjE3LDEwNi43NGg1MS4xNnY1NS4wN2gtNTEuMTZ2LTU1LjA3Wk0xMTkwLjMzLDEuNTRsLjA0LDU0Ljg0aDU4LjhsLTQ2LjY4LDUwLjExaC0xMi4yN3Y1NS41N2gtNTEuMDV2LTU2LjVsNTEuMi00OS4xOC01MS4yLjA0VjEuNTRoNTEuMTZaTTEzMDAuMzMsMS41NHYxMDUuMzdsLTUxLjE2LTUwLjUzVjEuNTRoNTEuMTZaIiBmaWxsPSIjMzA4ZDQzIiBzdHJva2Utd2lkdGg9IjAiLz48L3N2Zz4=`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-bottom: 2px solid #dee2e6;
        }
        .content {
          padding: 30px 20px;
          background-color: #ffffff;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #318d43;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #6c757d;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 20px;
        }
        a[class="button"] {
          color: #ffffff !important;
          text-decoration: none !important;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>myHometown - Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset the password for your MyHometown account associated with ${email}.</p>
          <p>Click the button below to reset your password. This link will expire in 24 hours.</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Your Password</a>
          </p>
          <p>If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.</p>
          <p>For security reasons, this link will expire in 24 hours. If you need to reset your password after that, please request a new reset link.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} MyHometown. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Generate password reset token using Supabase
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/auth/reset-password`,
      },
    });

    if (error) {
      throw error;
    }

    // Get the reset link from Supabase response
    const resetLink = data.properties.action_link;

    // Send the custom formatted email
    const info = await myHometownTransporter.sendMail({
      to: email,
      subject: "Reset Your MyHometown Password",
      html: formattedHtml(email, resetLink),
    });

    console.log("Password reset email sent: %s", info.messageId);

    return new Response(
      JSON.stringify({
        message: "Password reset email sent successfully",
        messageId: info.messageId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Password reset email error:", error);
    return new Response(
      JSON.stringify({
        message: "Error sending password reset email",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
