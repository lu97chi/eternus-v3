export const weddingCustomer = (details) => {
    const { bride_name, groom_name, budget, additional_info, wedding_type } = details
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          margin: 0;
          padding: 0;
          background-color: #f8f4f1;
          color: #333;
        }
        .email-container {
          max-width: 700px;
          margin: 40px auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e0de;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 28px;
          color: #5a4736;
          margin-bottom: 10px;
        }
        .header p {
          font-size: 16px;
          color: #666;
        }
        .content p {
          line-height: 1.6;
          font-size: 16px;
          margin: 15px 0;
        }
        .content strong {
          color: #5a4736;
        }
        .cta {
          margin-top: 30px;
          text-align: center;
        }
        .cta a {
          display: inline-block;
          padding: 12px 25px;
          font-size: 16px;
          background-color: #5a4736;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .cta a:hover {
          background-color: #4a392c;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Thank You for Trusting Eternus</h1>
          <p>Your journey to an unforgettable wedding begins here.</p>
        </div>
        <div class="content">
          <p>Dear <strong>${bride_name}</strong> and <strong>${groom_name}</strong>,</p>
          <p>
            We are thrilled to have the opportunity to be part of your wedding journey. 
            At <strong>Eternus</strong>, we believe every wedding is a timeless celebration of love, and 
            we are committed to ensuring your special day is everything you’ve ever dreamed of.
          </p>
          <p><strong>Here are the details we’ve received:</strong></p>
          <p><strong>Bride:</strong> ${bride_name}</p>
          <p><strong>Groom:</strong> ${groom_name}</p>
          <p><strong>Budget:</strong> ${budget}</p>
          <p><strong>Wedding Type:</strong> ${wedding_type}</p>
          <p><strong>Additional Information:</strong> ${additional_info}</p>
          <p>
            If there’s anything else you’d like us to know or discuss, feel free to reach out at any time.
            Our team is here to guide you through every step of the process.
          </p>
        </div>
        <div class="cta">
          <a href="https://eternus.com/contact" target="_blank">Schedule a Consultation</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Eternus. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}