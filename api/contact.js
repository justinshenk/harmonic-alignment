// Vercel serverless function for contact form - v2
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_API_KEY;
    const tableName = 'Contact'; // Separate table for contact form submissions

    // Check env vars
    if (!baseId || !apiKey) {
        console.error('[Contact] Missing AIRTABLE_BASE_ID or AIRTABLE_API_KEY');
        return res.status(200).json({
            success: true,
            message: 'Thank you for your message!'
        });
    }

    try {
        const { email, name, message, subscribe, source } = req.body;

        // Validate required fields
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Prepare Airtable record
        const record = {
            fields: {
                'Email': email,
                'Name': name || '',
                'Message': message || '',
                'Subscribe': subscribe === true || subscribe === 'true',
                'Source': source || '',
                'Timestamp': new Date().toISOString(),
                'Type': 'Contact'
            }
        };

        // Send to Airtable with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const airtableResponse = await fetch(
            `https://api.airtable.com/v0/${baseId}/${tableName}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ records: [record] }),
                signal: controller.signal
            }
        );

        clearTimeout(timeout);

        if (!airtableResponse.ok) {
            const errorData = await airtableResponse.text();
            console.error('[Contact] Airtable error:', airtableResponse.status, errorData);
            // Still return success to user - don't expose backend errors
            return res.status(200).json({
                success: true,
                message: 'Thank you for your message! We\'ll get back to you soon.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Thank you for your message! We\'ll get back to you soon.'
        });

    } catch (error) {
        console.error('[Contact] Error:', error.message);
        // Return success to user even on error - message intent received
        return res.status(200).json({
            success: true,
            message: 'Thank you for your message!'
        });
    }
}
