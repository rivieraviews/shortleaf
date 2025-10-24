import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { insertUrl, getUrl, urlExists, incrementClickCount, insertClick, getStats } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

//schema for URL shortening validation
const shortenSchema = z.object({
    originalUrl: z.string().regex(/^https?:\/\/.+/, { message: "Invalid URL format. Must be a valid URL with protocol (http:// or https://)." }),
    customId: z.string()
        .min(3, { message : "Custom ID must be at least 3 characters." })
        .max(20, { message : "Custom ID must be at most 20 characters." })
        .regex(/^[a-zA-Z0-9_-]+$/, { message: "Custom ID can only contain letters, numbers, underscores, and hyphens."})
        .optional()
});

app.post('/shorten', (req, res) => {
    //validate request body with zod
    try {
        if (!req.body || !req.body.originalUrl) {
            return res.status(400).json({
                error: "Missing URL in request body"
            });
        }

        const result = shortenSchema.safeParse(req.body);
        
        if (!result.success) {
            return res.status(400).json({
                error: "Invalid URL format. Must be a valid URL starting with http:// or https://"
            });
        }

    const { originalUrl, customId } = result.data;

    let shortId;

    if (customId)
    {
        if (urlExists.get(customId))
        {
            return res.status(409).json({
                error: "Custom ID is already in use. Please choose another."
            });
        }
        shortId = customId;
    }
    else
    {
        //generating unique shortid and preventing collisions
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            shortId = nanoid(6);
            const exists = urlExists.get(shortId);
            if (!exists) break; //unique id found
            attempts++;
        }

        //if we've exhausted attempts and the last generated id still exists, fail
        if (attempts >= maxAttempts && urlExists.get(shortId)) {
            return res.status(500).json({
                error: "Unable to generate a unique short URL. Please try again."
            });
        }
    }

    const createdAt = Date.now();
    insertUrl.run(shortId, originalUrl, createdAt);

    const shortUrl = `${req.protocol}://${req.get("host")}/${shortId}`;
    res.json({ shortUrl });
    } catch (error) {
        return res.status(500).json({
            error: "An error occurred while processing your request."
        });
    }
});

//new endpoint for analytics
app.get('/stats/:shortId', (req, res) => {
    const { shortId } = req.params;
    const stats = getStats.get(shortId);

    if (!stats) {
        return res.status(404).json({ error: "URL not found" });
    }

    res.json({
        shortId: stats.short_id,
        originalUrl: stats.original_url,
        createdAt: stats.created_at,
        clickCount: stats.click_count,
    });
});

//redirect endpoint with click tracking
app.get('/:shortId', (req, res) => {
    const { shortId } = req.params;
    const row = getUrl.get(shortId);

    if (!row)
    {
        return res.status(404).json({ error: "URL not found" });
    }

    const clickedAt = Date.now();
    const userAgent = req.get('user-agent') || null;
    const referrer = req.get('referer') || null;

    incrementClickCount.run(shortId);
    insertClick.run(shortId, clickedAt, userAgent, referrer);

    res.redirect(row.original_url);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`shortleaf running on port ${PORT}`));