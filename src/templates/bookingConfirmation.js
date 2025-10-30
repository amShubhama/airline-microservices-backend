const bookingConfirmation = (data) => {
  const { bookingDetails } = data;

  return `
  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #e6f0ff; padding: 30px;">
    <div style="max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #004aad, #007bff); color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">FlyHigh Airlines</h2>
        <p style="margin: 5px 0 0; font-size: 14px;">Flight Booking Confirmation</p>
      </div>

      <!-- Greeting & Intro -->
      <div style="padding: 25px 30px; color: #333;">
        <p style="font-size: 15px;">Dear Passenger,</p>
        <p style="font-size: 15px;">Your booking has been <b>successfully confirmed</b>. Below are your flight details:</p>
      </div>

      <!-- Flight Details -->
      <div style="padding: 0 30px;">
        <h3 style="color: #004aad; border-bottom: 2px solid #eee; padding-bottom: 8px;">✈️ Flight Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 8px 0; color: #555;">Flight Number:</td>
            <td style="padding: 8px 0; font-weight: bold;">${bookingDetails.flightNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555;">From (Airport ID):</td>
            <td style="padding: 8px 0; font-weight: bold;">${bookingDetails.departureAirportId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555;">To (Airport ID):</td>
            <td style="padding: 8px 0; font-weight: bold;">${bookingDetails.arrivalAirportId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555;">Departure Time:</td>
            <td style="padding: 8px 0; font-weight: bold;">${new Date(bookingDetails.departureTime).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555;">Arrival Time:</td>
            <td style="padding: 8px 0; font-weight: bold;">${new Date(bookingDetails.arrivalTime).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555;">Boarding Gate:</td>
            <td style="padding: 8px 0; font-weight: bold;">${bookingDetails.boardingGate}</td>
          </tr>
        </table>
      </div>

      <!-- Booking Summary -->
      <div style="padding: 20px 30px;">
        <h3 style="color: #004aad; border-bottom: 2px solid #eee; padding-bottom: 8px;">📋 Booking Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #555;">Booking ID:</td>
            <td style="padding: 8px 0; font-weight: bold;">${bookingDetails.bookingId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555;">Booking Date:</td>
            <td style="padding: 8px 0; font-weight: bold;">${new Date(bookingDetails.bookingDate).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555;">Status:</td>
            <td style="padding: 8px 0; font-weight: bold; color: green;">${bookingDetails.status}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555;">Seats:</td>
            <td style="padding: 8px 0; font-weight: bold;">${bookingDetails.noOfSeats}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555;">Total Cost:</td>
            <td style="padding: 8px 0; font-weight: bold;">₹${bookingDetails.totalCost}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555;">Payment Status:</td>
            <td style="padding: 8px 0; font-weight: bold; color: ${bookingDetails.paymentStatus === 'Success' ? 'green' : 'red'
    };">${bookingDetails.paymentStatus}</td>
          </tr>
        </table>
      </div>

      <!-- Closing Note -->
      <div style="padding: 0 30px 25px 30px; color: #333;">
        <p style="margin-top: 20px;">Thank you for choosing <b>FlyHigh Airlines</b>.<br>We wish you a pleasant journey!</p>
      </div>

      <!-- Footer -->
      <div style="background-color: #004aad; color: white; text-align: center; padding: 15px; font-size: 13px;">
        <p style="margin: 5px 0;">FlyHigh Airlines © ${new Date().getFullYear()}</p>
        <p style="margin: 5px 0;">This is an automated email. Please do not reply.</p>
      </div>

    </div>
  </div>
  `;
};

module.exports = bookingConfirmation;