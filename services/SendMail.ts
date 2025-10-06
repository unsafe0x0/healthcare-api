interface EmailOptions {
  to: string | string[];
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: EmailOptions) {
  try {
    const apiUrl = process.env.EMAIL_API_URL;

    const response = await fetch(apiUrl!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject, html: body }),
    });

    const text = await response.text();
    let result: any;

    try {
      result = JSON.parse(text);
    } catch {
      result = { success: response.ok, message: text };
    }

    if (!response.ok || result?.success === false) {
      const errorMsg = result?.message || "Failed to send email";
      console.error("Email API error:", errorMsg);
      throw new Error(errorMsg);
    }

    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email sending failed");
  }
}
