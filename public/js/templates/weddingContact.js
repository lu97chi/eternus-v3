export const weddingContact = (details) => {
    const { bride_name, groom_name, budget, email, additional_info } = details
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          color: #333;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
          font-size: 24px;
          color: #0078d7;
          text-align: center;
          margin-bottom: 20px;
        }
        p {
          margin: 10px 0;
        }
        strong {
          color: #444;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #999;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h1>Wedding Planner Form Submission</h1>
        <p>New form submission from <strong>${bride_name}</strong> and <strong>${groom_name}</strong>:</p>
        <p><strong>Bride Name:</strong> ${bride_name}</p>
        <p><strong>Groom Name:</strong> ${groom_name}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Wedding Type:</strong> ${wedding_type}</p>
        <p><strong>Additional Info:</strong> ${additional_info}</p>
        <p><strong>Email:</strong> ${email}</p>
        <div class="footer">
          <p>Thank you for trusting us to plan your special day!</p>
        </div>
      </div>
    </body>
    </html>
    `
}