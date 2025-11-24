// Vercel serverless function for contact form
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { email, name, message } = req.body;

        // Validate required fields
        if (!email || !message) {
            return res.status(400).json({ error: 'Email and message are required' });
        }

        // Prepare Airtable record
        const record = {
            fields: {
                Email: email,
                Name: name || '',
                Message: message,
                SubmitDate: new Date().toISOString(),
                Type: 'Contact'
            }
        };

        // Send to Airtable
        const airtableResponse = await fetch(
            `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ records: [record] })
            }
        );

        if (!airtableResponse.ok) {
            const errorData = await airtableResponse.text();
            console.error('Airtable error:', errorData);
            throw new Error('Failed to save to Airtable');
        }

        const result = await airtableResponse.json();

        return res.status(200).json({
            success: true,
            message: 'Thank you for your message! We\'ll get back to you soon.'
        });

    } catch (error) {
        console.error('Contact error:', error);
        return res.status(500).json({
            error: 'Failed to send message. Please try again later.'
        });
    }
}
