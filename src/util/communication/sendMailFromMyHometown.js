// utils/sendEmail.js

const aws = require('aws-sdk');

// Configure AWS SDK
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_SESSION_TOKEN,
});

const ses = new aws.SES({ apiVersion: '2010-12-01' });

const sendEmail = async (to, subject, htmlContent) => {
    const params = {
        Source: 'sender@example.com', // Your verified email in SES
        Destination: { ToAddresses: [to] },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: htmlContent
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        }
    };

    try {
        await ses.sendEmail(params).promise();
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email sending error', error);
        throw error;
    }
};

module.exports = sendEmail;