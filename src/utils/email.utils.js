// Mock Brevo email service
const sendEmail = async (to, subject, htmlContent) => {
    // In a real application, you'd use Brevo SDK here:
    // const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    console.log('--- MOCK EMAIL DELIVERED ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${htmlContent}`);
    console.log('----------------------------');
    
    return true;
};

module.exports = {
    sendEmail,
};
