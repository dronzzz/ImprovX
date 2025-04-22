const nodemailer = require('nodemailer');


// Create transporter with SMTP configuration
const transporter = nodemailer.createTransport({
    host: "mail.smtp2go.com",
    port: 587,
    secure: false, // Use STARTTLS
    requireTLS: true,
    auth: {
        user: "reverenttaussig1@heywhatsoup.com",
        pass: "sKAisyEd9dLQ6vB1"
    }
});
// const transporter = nodemailer.createTransport({
//     host: "smtp.mailersend.net",
//     port: 587,
//     secure: false, // Use STARTTLS
//     requireTLS: true,
//     auth: {
//         user: "MS_7RIP3y@test-r9084zvr0n8gw63d.mlsender.net",
//         pass: "mssp.olREzQs.jpzkmgqyqoyl059v.ExskLUF"
//     }
// });




// Email options
const mailOptions = {
    from: "reverenttaussig1@heywhatsoup.com",
    to: 'koyeni1237@cxnlab.com', // Replace with recipient email
    subject: 'Test Email from Nodemailer',
    text: 'This is a test email sent using Nodemailer!',
    html: '<p>This is a test email sent using <b>Nodemailer</b>!</p>'
};

// Function to send email
async function sendTestEmail() {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Execute the function
sendTestEmail();