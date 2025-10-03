import QRCode from "qrcode";
import { uploadImage } from "./cloudinary";

export async function generateQr(appointmentId: string): Promise<string> {
  const clientUrl = process.env.CORS_ORIGIN;
  const data = `${clientUrl}/appointment/${appointmentId}`;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      margin: 0,
      width: 200,
    });

    const base64Data = qrCodeDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const qrCodeBuffer = Buffer.from(base64Data, "base64");

    const fileLike = {
      toBuffer: async () => qrCodeBuffer,
    };

    const result = await uploadImage(fileLike, appointmentId, "qr-codes");
    return result.url;
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw new Error("Failed to generate QR code");
  }
}
