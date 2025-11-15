require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SerpApi = require("google-search-results-nodejs"); 

const app = express();
const PORT =  process.env.PORT || 3000;

const SERPAPI_KEY = process.env.API_KEY; 

if (!SERPAPI_KEY) {
    console.error("\n!!! ERROR: Your SerpApi API Key was not found in the .env file. !!!\n");
}

app.use(cors());

app.get('/', (req, res) => {
    res.send('<h1>Wardrobe API Server (Powered by SerpApi)</h1><p>Server is running correctly.</p>');
});

async function getShoppingResults(query, page = 1) {
    try {
        console.log(`Searching with SerpApi for: "${query}"`);
        const search = new SerpApi.GoogleSearch(SERPAPI_KEY);

        const params = {
            q: query,
            engine: 'google',
            tbm: 'shop',
            // --- THIS IS THE KEY ADDITION ---
            location: 'United States', // Ensures we get results from a major market
            hl: 'en',
            start: (page - 1) * 10
        };

        const json = await new Promise((resolve) => {
            search.json(params, (result) => {
                resolve(result);
            });
        });

        const shoppingResults = json.shopping_results || [];

        if (shoppingResults.length === 0) {
            console.log("SerpApi returned no results. This could be due to your API plan limits or the query having no results in the specified location.");
            return [];
        }

        const formattedResults = shoppingResults.map(item => ({
            title: item.title,
            price: item.price,
            source: item.source,
            link: item.link,
            imageUrl: item.thumbnail
        }));

        console.log(`Found ${formattedResults.length} products via SerpApi.`);
        return formattedResults;

    } catch (error) {
        // Now we also log the full error from SerpApi for better debugging
        console.error("Error calling SerpApi:", error);
        return [];
    }
}

// The rest of the file remains the same
app.get('/api/browse', async (req, res) => {
    const { style, piece, page = 1 } = req.query;

    if (!style || !piece) {
        return res.status(400).json({ error: 'Style and piece query parameters are required.' });
    }

    const searchQuery = `${style} ${piece}`;
    const items = await getShoppingResults(searchQuery, parseInt(page));
    res.json(items);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});