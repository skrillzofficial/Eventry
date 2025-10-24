import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, X } from 'lucide-react';
import QRCode from 'qrcode';
import { TicketPDFGenerator } from '../../utils/ticketGenerator';

const QRCodeDisplay = ({ ticket, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [ticket]);

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      const qrData = ticket.qrCode || ticket.ticketNumber;
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#FF6B35',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('QR Code generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    const success = await TicketPDFGenerator.downloadPDF(ticket);
    if (success) {
      // Optional: Show success message
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Your Ticket QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Event Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">{ticket.eventTitle}</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p> {new Date(ticket.eventDate).toLocaleDateString()}</p>
            <p>{ticket.eventTime}</p>
            <p> {ticket.eventVenue}, {ticket.eventCity}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-6">
          {isGenerating ? (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="animate-spin h-8 w-8 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-64 h-64"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Present this QR code at the event entrance
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Ticket: {ticket.ticketNumber}
              </p>
            </>
          )}
        </div>

        {/* Status & Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-600 font-medium">Valid Ticket</span>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8535] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download PDF Ticket
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 text-center">
             Keep this QR code secure. Do not share publicly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;