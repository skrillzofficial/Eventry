import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export class TicketPDFGenerator {
  static async generatePDF(ticketData) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [210, 297] // A4 size
    });

    // Add background color
    pdf.setFillColor(255, 107, 53); // #FF6B35
    pdf.rect(0, 0, 210, 60, 'F');

    // Add header
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EVENT TICKET', 105, 25, { align: 'center' });

    // Add event title
    pdf.setFontSize(18);
    pdf.setTextColor(255, 255, 255);
    pdf.text(ticketData.eventTitle, 105, 40, { align: 'center', maxWidth: 180 });

    // Add content background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(10, 70, 190, 217, 'F');

    // Add event details
    pdf.setFontSize(12);
    pdf.setTextColor(51, 51, 51);

    let yPosition = 85;

    // Date
    pdf.setFont('helvetica', 'bold');
    pdf.text('DATE:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(this.formatDate(ticketData.eventDate), 50, yPosition);
    yPosition += 10;

    // Time
    pdf.setFont('helvetica', 'bold');
    pdf.text('TIME:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${ticketData.eventTime}${ticketData.eventEndTime ? ` - ${ticketData.eventEndTime}` : ''}`, 50, yPosition);
    yPosition += 10;

    // Venue
    pdf.setFont('helvetica', 'bold');
    pdf.text('VENUE:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(ticketData.eventVenue, 50, yPosition);
    yPosition += 10;

    // City
    pdf.setFont('helvetica', 'bold');
    pdf.text('CITY:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(ticketData.eventCity, 50, yPosition);
    yPosition += 15;

    // Ticket details
    pdf.setFont('helvetica', 'bold');
    pdf.text('TICKET NUMBER:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(ticketData.ticketNumber, 60, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'bold');
    pdf.text('QUANTITY:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(ticketData.quantity.toString(), 60, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL AMOUNT:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${ticketData.currency === 'NGN' ? '₦' : '$'}${ticketData.totalPrice.toLocaleString()}`, 60, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'bold');
    pdf.text('STATUS:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(ticketData.status.toUpperCase(), 60, yPosition);
    yPosition += 15;

    // Generate QR Code
    const qrCodeDataURL = await this.generateQRCode(ticketData.qrCode || ticketData.ticketNumber);
    
    // Add QR Code to PDF
    if (qrCodeDataURL) {
      pdf.addImage(qrCodeDataURL, 'PNG', 130, 85, 50, 50);
      
      // QR Code label
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Scan QR Code at entrance', 155, 140, { align: 'center' });
    }

    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(102, 102, 102);
    pdf.text(`Purchased on: ${this.formatDate(ticketData.purchaseDate)}`, 20, 250);
    pdf.text('Eventry - Your Event Companion', 190, 290, { align: 'right' });

    // Add security features
    this.addSecurityFeatures(pdf, ticketData);

    return pdf;
  }

  static async generateQRCode(data) {
    try {
      return await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#FF6B35',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('QR Code generation failed:', err);
      return null;
    }
  }

  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static addSecurityFeatures(pdf, ticketData) {
    // Add watermark
    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    pdf.setFont('helvetica', 'normal');
    
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        pdf.text('EVENTRY', 20 + (i * 20), 80 + (j * 25), { angle: 45 });
      }
    }

    // Add unique identifier
    pdf.setFontSize(6);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`ID: ${ticketData.id}`, 10, 285);
  }

  static async downloadPDF(ticketData) {
    try {
      const pdf = await this.generatePDF(ticketData);
      pdf.save(`ticket-${ticketData.ticketNumber}.pdf`);
      return true;
    } catch (error) {
      console.error('PDF generation failed:', error);
      return false;
    }
  }
}