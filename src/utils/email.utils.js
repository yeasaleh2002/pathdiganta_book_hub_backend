const sendEmail = async (to, subject, htmlContent) => {
    // If no API key is provided, gracefully fallback to console logging (useful for local dev)
    if (!process.env.BREVO_API_KEY) {
        console.log('--- MOCK EMAIL DELIVERED (No Brevo Key) ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${htmlContent}`);
        console.log('------------------------------------------');
        return true;
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: process.env.BREVO_SENDER_NAME || 'Pathdigonto Hub',
                    email: process.env.BREVO_SENDER_EMAIL || 'noreply@pathdigonto.com'
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Brevo API Error:', errorData);
            throw new Error('Failed to send email via Brevo');
        }

        return true;
    } catch (error) {
        console.error('Email delivery failed:', error);
        // We don't throw here so it doesn't crash the registration flow, but you could.
        return false;
    }
};

module.exports = {
    sendEmail,
};
