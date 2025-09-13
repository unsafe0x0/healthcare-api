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
      body: JSON.stringify({ to, subject, body }),
    });

    const result = (await response.json()) as {
      success: boolean;
      message: string;
    };

    if (!response.ok || !result.success) {
      const errorMsg = result?.message || "Failed to send email";
      console.error("Email API error:", errorMsg);
    }

    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email sending failed");
  }
}
