import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export class TicketPDFGenerator {
  static async generatePDF(ticketData) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [210, 148] // Half A4 for ticket size
    });

    const primaryColor = [255, 107, 53]; // #FF6B35
    const secondaryColor = [255, 133, 53]; // #FF8535
    const darkColor = [51, 51, 51];
    const lightColor = [153, 153, 153];
    const backgroundColor = [250, 250, 250];

    // Add subtle background pattern
    this.addBackgroundPattern(pdf, backgroundColor);

    // Header with gradient
    this.createGradientHeader(pdf, primaryColor, secondaryColor);

    // Event title
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(ticketData.eventTitle.toUpperCase(), 105, 25, { align: 'center', maxWidth: 180 });

    // Ticket label - show copy number if multiple tickets
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255, 0.9);
    pdf.setFont('helvetica', 'normal');
    
    if (ticketData.quantity > 1 && ticketData.isIndividualCopy) {
      pdf.text(`TICKET ${ticketData.copyNumber} OF ${ticketData.quantity}`, 105, 35, { align: 'center' });
    } else {
      pdf.text('ADMIT ONE', 105, 35, { align: 'center' });
    }

    // Main content area
    const contentStart = 45;

    // Left column - Event details
    pdf.setFontSize(10);
    pdf.setTextColor(darkColor);

    let yPos = contentStart + 10;

    // Date section
    this.createDetailSection(pdf, 20, yPos, 'CALENDAR', this.formatDate(ticketData.eventDate));
    yPos += 8;

    // Time section
    this.createDetailSection(pdf, 20, yPos, 'CLOCK', 
      `${ticketData.eventTime}${ticketData.eventEndTime ? ` - ${ticketData.eventEndTime}` : ''}`);
    yPos += 8;

    // Venue section
    this.createDetailSection(pdf, 20, yPos, 'LOCATION', ticketData.eventVenue);
    yPos += 8;

    // City section
    this.createDetailSection(pdf, 20, yPos, 'CITY', ticketData.eventCity);
    yPos += 15;

    // Ticket details in a styled box
    pdf.setFillColor(255, 255, 255);
    pdf.rect(15, yPos, 80, 40, 'F');
    pdf.setDrawColor(primaryColor);
    pdf.rect(15, yPos, 80, 40, 'S');

    // Ticket details content
    pdf.setFontSize(9);
    pdf.setTextColor(lightColor);
    pdf.text('TICKET DETAILS', 25, yPos + 7);

    pdf.setFontSize(8);
    pdf.setTextColor(darkColor);

    pdf.text(`Number: ${ticketData.ticketNumber}`, 25, yPos + 15);
    pdf.text(`Type: ${ticketData.ticketType}`, 25, yPos + 21);
    
    // Show individual ticket info for multiple tickets
    if (ticketData.quantity > 1 && ticketData.isIndividualCopy) {
      pdf.text(`Ticket: ${ticketData.copyNumber}/${ticketData.quantity}`, 25, yPos + 27);
      const currencySymbol = ticketData.currency === 'NGN' ? '₦' : '$';
      pdf.text(`Price: ${currencySymbol}${(ticketData.displayPrice || ticketData.ticketPrice || 0).toLocaleString()}`, 25, yPos + 33);
    } else {
      pdf.text(`Quantity: ${ticketData.quantity}`, 25, yPos + 27);
      const currencySymbol = ticketData.currency === 'NGN' ? '₦' : '$';
      pdf.text(`Total: ${currencySymbol}${(ticketData.totalPrice || 0).toLocaleString()}`, 25, yPos + 33);
    }

    // Right column - QR Code and security features
    const qrCodeDataURL = await this.generateQRCode(ticketData.ticketNumber);
    
    if (qrCodeDataURL) {
      // QR Code container with border
      pdf.setFillColor(255, 255, 255);
      pdf.rect(110, contentStart + 10, 80, 80, 'F');
      pdf.setDrawColor(primaryColor);
      pdf.rect(110, contentStart + 10, 80, 80, 'S');

      // Add QR Code
      pdf.addImage(qrCodeDataURL, 'PNG', 120, contentStart + 20, 60, 60);
      
      // QR Code label
      pdf.setFontSize(8);
      pdf.setTextColor(lightColor);
      pdf.text('SCAN AT ENTRANCE', 150, contentStart + 85, { align: 'center' });
    }

    // Security section
    pdf.setFillColor(245, 245, 245);
    pdf.rect(110, contentStart + 95, 80, 25, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(110, contentStart + 95, 80, 25, 'S');

    pdf.setFontSize(7);
    pdf.setTextColor(darkColor);
    pdf.text('SECURITY CODE', 150, contentStart + 102, { align: 'center' });
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor);
    pdf.text(ticketData.securityCode || ticketData.ticketNumber.slice(-8), 150, contentStart + 110, { align: 'center' });

    // Footer section
    const footerY = 130;
    pdf.setDrawColor(primaryColor);
    pdf.line(15, footerY, 195, footerY);

    pdf.setFontSize(7);
    pdf.setTextColor(lightColor);
    pdf.setFont('helvetica', 'normal');
    
    // Left footer - purchase info
    pdf.text(`Purchased: ${this.formatShortDate(ticketData.purchaseDate)}`, 20, footerY + 5);
    pdf.text(`Status: ${ticketData.status.toUpperCase()}`, 20, footerY + 10);

    // Right footer - organizer
    pdf.text(`Organizer: ${ticketData.organizerName || 'Eventry'}`, 190, footerY + 5, { align: 'right' });
    pdf.text('eventry.com', 190, footerY + 10, { align: 'right' });

    // Add decorative elements
    this.addDecorativeElements(pdf, primaryColor);

    return pdf;
  }

  // New method for downloading individual tickets
  static async downloadIndividualPDF(ticketData) {
    try {
      const pdf = await this.generatePDF(ticketData);
      const pdfBlob = pdf.output('blob');
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticketData.ticketNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL after download
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Individual PDF download failed:', error);
      return false;
    }
  }

  static createGradientHeader(pdf, startColor, endColor) {
    // Simple gradient effect using multiple rectangles
    const steps = 10;
    const headerHeight = 40;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * ratio);
      const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * ratio);
      const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * ratio);
      
      pdf.setFillColor(r, g, b);
      pdf.rect(0, i * (headerHeight / steps), 210, headerHeight / steps, 'F');
    }
  }

  static createDetailSection(pdf, x, y, icon, text) {
    pdf.setFontSize(8);
    pdf.setTextColor(153, 153, 153);
    pdf.setFont('helvetica', 'bold');
    pdf.text(icon, x, y);
    
    pdf.setFontSize(9);
    pdf.setTextColor(51, 51, 51);
    pdf.setFont('helvetica', 'normal');
    pdf.text(text, x + 15, y);
  }

  static addBackgroundPattern(pdf, color) {
    pdf.setFillColor(...color);
    pdf.rect(0, 0, 210, 148, 'F');
    
    // Add subtle dots pattern
    pdf.setFillColor(255, 255, 255, 0.3);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 210;
      const y = Math.random() * 148;
      const size = Math.random() * 0.5;
      pdf.circle(x, y, size, 'F');
    }
  }

  static addDecorativeElements(pdf, color) {
    // Top corner decorations
    pdf.setFillColor(...color);
    
    // Top left corner
    pdf.circle(10, 10, 3, 'F');
    pdf.circle(20, 10, 2, 'F');
    
    // Top right corner
    pdf.circle(200, 10, 3, 'F');
    pdf.circle(190, 10, 2, 'F');
    
    // Bottom left corner
    pdf.circle(10, 138, 3, 'F');
    pdf.circle(20, 138, 2, 'F');
    
    // Bottom right corner
    pdf.circle(200, 138, 3, 'F');
    pdf.circle(190, 138, 2, 'F');

    // Perforation lines (ticket tear-off style)
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    
    // Top perforation
    for (let x = 15; x < 195; x += 3) {
      pdf.line(x, 5, x + 1.5, 5);
    }
    
    // Bottom perforation
    for (let x = 15; x < 195; x += 3) {
      pdf.line(x, 143, x + 1.5, 143);
    }
  }

  static async generateQRCode(data) {
    try {
      return await QRCode.toDataURL(data, {
        width: 300,
        margin: 1,
        color: {
          dark: '#FF6B35',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
    } catch (err) {
      return null;
    }
  }

  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  static formatShortDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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