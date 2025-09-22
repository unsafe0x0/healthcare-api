import QRCode from "qrcode";
import { uploadImage } from "./cloudinary";

export async function generateQr(appointmentId: string): Promise<string> {
  const clientUrl = process.env.CORS_ORIGIN;
  const data = `${clientUrl}/appointment/${appointmentId}`;
  try {
    const qrBuffer = await QRCode.toBuffer(data, {
      margin: 0,
      width: 200,
    });

    const result = await uploadImage(qrBuffer, appointmentId, "qr-codes");
    return result.url;
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw new Error("Failed to generate QR code");
  }
}
