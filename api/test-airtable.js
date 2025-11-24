// Test endpoint to check Airtable connection and schema
export default async function handler(req, res) {
    try {
        // Fetch table schema
        const response = await fetch(
            `https://api.airtable.com/v0/meta/bases/${process.env.AIRTABLE_BASE_ID}/tables`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
                }
            }
        );

        if (!response.ok) {
            const error = await response.text();
            return res.status(500).json({
                error: 'Failed to fetch schema',
                details: error,
                env: {
                    hasApiKey: !!process.env.AIRTABLE_API_KEY,
                    hasBaseId: !!process.env.AIRTABLE_BASE_ID,
                    hasTableName: !!process.env.AIRTABLE_TABLE_NAME
                }
            });
        }

        const data = await response.json();

        // Find our table
        const table = data.tables.find(t => t.name === process.env.AIRTABLE_TABLE_NAME);

        if (!table) {
            return res.status(404).json({
                error: 'Table not found',
                tableName: process.env.AIRTABLE_TABLE_NAME,
                availableTables: data.tables.map(t => t.name)
            });
        }

        // Return field names
        return res.status(200).json({
            tableName: table.name,
            tableId: table.id,
            fields: table.fields.map(f => ({
                name: f.name,
                type: f.type
            }))
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
}
