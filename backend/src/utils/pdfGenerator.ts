import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface ReservationData {
  reservationId: number;
  hotelName: string;
  roomType: string;
  roomNumber: string;
  userName: string;
  userEmail: string;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  nights: number;
  pricePerNight: number;
}

export const generateBookingPDF = (data: ReservationData): Readable => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks: Buffer[] = [];
      const stream = new Readable();

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
        stream.push(chunk);
      });

      doc.on('end', () => {
        stream.push(null);
        resolve(stream);
      });

      doc.on('error', (err) => {
        reject(err);
      });

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('Booking Confirmation', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text('Hotel Reservation System', { align: 'center' });
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // Reservation Details
      doc.fontSize(14).font('Helvetica-Bold').text('Reservation Details', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Confirmation ID: ${data.reservationId}`);
      doc.text(`Booking Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
      doc.moveDown(0.5);

      // Guest Information
      doc.fontSize(14).font('Helvetica-Bold').text('Guest Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Name: ${data.userName}`);
      doc.text(`Email: ${data.userEmail}`);
      doc.moveDown(0.5);

      // Hotel & Room Information
      doc.fontSize(14).font('Helvetica-Bold').text('Hotel & Room Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Hotel: ${data.hotelName}`);
      doc.text(`Room Type: ${data.roomType}`);
      doc.text(`Room Number: ${data.roomNumber}`);
      doc.moveDown(0.5);

      // Stay Information
      doc.fontSize(14).font('Helvetica-Bold').text('Stay Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      
      const checkInFormatted = new Date(data.checkInDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      const checkOutFormatted = new Date(data.checkOutDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });

      doc.text(`Check-in: ${checkInFormatted}`);
      doc.text(`Check-out: ${checkOutFormatted}`);
      doc.text(`Number of Nights: ${data.nights}`);
      doc.moveDown(0.5);

      // Price Breakdown
      doc.fontSize(14).font('Helvetica-Bold').text('Price Breakdown', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Price per Night: $${data.pricePerNight.toFixed(2)}`);
      doc.text(`Number of Nights: ${data.nights}`);
      doc.moveTo(50, doc.y).lineTo(200, doc.y).stroke();
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total Price: $${data.totalPrice.toFixed(2)}`);
      doc.moveDown(1);

      // Footer
      doc.fontSize(10).font('Helvetica').fillColor('#666666');
      doc.text('Thank you for your booking! Please keep this confirmation for your records.', { align: 'center' });
      doc.text('For any inquiries, please contact our support team.', { align: 'center' });
      doc.moveDown(0.5);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  }) as unknown as Readable;
};
