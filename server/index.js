// Minimal Express endpoint to send mail via nodemailer.
// Run: node server/index.js  (install dependencies: express nodemailer dotenv)
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const deptEmails = {
    general: process.env.EMAIL_GENERAL || 'hello@instadocmetrics.com',
    sales: process.env.EMAIL_SALES || 'sales@instadocmetrics.com',
    support: process.env.EMAIL_SUPPORT || 'support@instadocmetrics.com',
    partnerships: process.env.EMAIL_PARTNERS || 'partners@instadocmetrics.com'
};

if(!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.FROM_EMAIL){
    console.warn('Missing SMTP config in .env — endpoint will fail until configured.');
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message, department } = req.body || {};
        if(!name || !email || !subject || !message) return res.status(400).json({ message: 'Missing fields' });

        const to = deptEmails[department] || deptEmails.general;
        const mail = {
            from: process.env.FROM_EMAIL,
            to,
            subject: `[Website] ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\nDepartment: ${department}\n\n${message}`,
            html: `<p><strong>Name:</strong> ${name}</p>
                   <p><strong>Email:</strong> ${email}</p>
                   <p><strong>Department:</strong> ${department}</p>
                   <hr/>
                   <p>${message.replace(/\n/g,'<br/>')}</p>`
        };

        await transporter.sendMail(mail);
        return res.json({ ok: true });
    } catch (err) {
        console.error('send error', err);
        return res.status(500).json({ message: 'Failed to send message' });
    }
});

app.listen(PORT, ()=> console.log(`Contact API running on http://localhost:${PORT}`));