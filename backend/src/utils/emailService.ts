import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: parseInt(process.env.MAILTRAP_PORT || "2525"),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export interface BookingConfirmationData {
  userEmail: string;
  userName: string;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  reservationId: string;
}

export const sendBookingConfirmation = async (data: BookingConfirmationData) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; margin: 20px 0; border-radius: 5px; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4f46e5; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .detail-value { color: #111827; }
          .total { font-size: 18px; font-weight: bold; color: #059669; margin-top: 10px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
          </div>
          
          <div class="content">
            <p>Dear ${data.userName},</p>
            <p>Thank you for booking with us! Your reservation has been confirmed. Here are the details of your booking:</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Reservation ID:</span>
                <span class="detail-value">#${data.reservationId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Hotel:</span>
                <span class="detail-value">${data.hotelName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Room Type:</span>
                <span class="detail-value">${data.roomType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-in Date:</span>
                <span class="detail-value">${data.checkInDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-out Date:</span>
                <span class="detail-value">${data.checkOutDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Price:</span>
                <span class="detail-value">$${data.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <p>A confirmation email has been sent to your account. You can view and manage your bookings in your dashboard.</p>
            
            <p>If you have any questions about your reservation, please don't hesitate to contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 Hotel Reservation System. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.MAILTRAP_FROM_EMAIL || "noreply@hotelreservation.com",
      to: data.userEmail,
      subject: `Booking Confirmation - Reservation #${data.reservationId}`,
      html: htmlContent,
    });
    console.log(`✅ Booking confirmation email sent to ${data.userEmail}`);
  } catch (error) {
    console.error("❌ Error sending booking confirmation email:", error);
    throw error;
  }
};

export const sendCancellationConfirmation = async (
  userEmail: string,
  userName: string,
  reservationId: string,
  refundAmount: number
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; margin: 20px 0; border-radius: 5px; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #dc2626; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .detail-value { color: #111827; }
          .refund { font-size: 18px; font-weight: bold; color: #059669; margin-top: 10px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cancellation Confirmation</h1>
          </div>
          
          <div class="content">
            <p>Dear ${userName},</p>
            <p>Your reservation has been successfully cancelled. Here are the details:</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Reservation ID:</span>
                <span class="detail-value">#${reservationId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Refund Amount:</span>
                <span class="detail-value refund">$${refundAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <p>The refund will be processed back to your original payment method within 5-7 business days.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 Hotel Reservation System. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.MAILTRAP_FROM_EMAIL || "noreply@hotelreservation.com",
      to: userEmail,
      subject: `Cancellation Confirmation - Reservation #${reservationId}`,
      html: htmlContent,
    });
    console.log(`✅ Cancellation confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error("❌ Error sending cancellation email:", error);
    throw error;
  }
};
