const AWS = require('aws-sdk');

// Configure AWS SES
const ses = new AWS.SES({ region: 'ap-southeast-2' });

exports.handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'All fields are required'
        })
      };
    }

    // Create email content
    const emailParams = {
      Source: 'noreply@auzlandre.com.au',
      Destination: {
        ToAddresses: ['jsharma1454@sdsu.edu']
      },
      Message: {
        Subject: {
          Data: `[Website Contact] ${subject} - ${name}`,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .field { margin-bottom: 15px; }
                    .label { font-weight: bold; color: #dc2626; }
                    .value { margin-top: 5px; }
                    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>New Contact Form Submission</h1>
                    </div>
                    <div class="content">
                      <div class="field">
                        <div class="label">Name:</div>
                        <div class="value">${name}</div>
                      </div>
                      <div class="field">
                        <div class="label">Email:</div>
                        <div class="value">${email}</div>
                      </div>
                      <div class="field">
                        <div class="label">Phone:</div>
                        <div class="value">${phone}</div>
                      </div>
                      <div class="field">
                        <div class="label">Subject:</div>
                        <div class="value">${subject}</div>
                      </div>
                      <div class="field">
                        <div class="label">Message:</div>
                        <div class="value">${message.replace(/\n/g, '<br>')}</div>
                      </div>
                    </div>
                    <div class="footer">
                      <p>This email was sent from the AuzLand website contact form.</p>
                      <p>Sent on: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

Message:
${message}

---
Sent from AuzLand website contact form
Sent on: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };

    // Send email via SES
    await ses.sendEmail(emailParams).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Contact form submitted successfully'
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send contact form. Please try again later.'
      })
    };
  }
};
