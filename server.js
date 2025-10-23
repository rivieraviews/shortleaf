import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());

const urlDatabase = new Map();

//schema for URL shortening validation
const shortenSchema = z.object({
    originalUrl: z.string().regex(/^https?:\/\/.+/, { message: "Invalid URL format. Must be a valid URL with protocol (http:// or https://)." })
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

    const { originalUrl } = result.data;

    const shortId = nanoid(6);
    urlDatabase.set(shortId, originalUrl);

    const shortUrl = `${req.protocol}://${req.get("host")}/${shortId}`;
    res.json({ shortUrl });
    } catch (error) {
        return res.status(500).json({
            error: "An error occurred while processing your request."
        });
    }
});

app.get('/:shortId', (req, res) => {
    const { shortId } = req.params;
    const originalUrl = urlDatabase.get(shortId);

    if (!originalUrl)
        return res.status(404).json({ error: "URL not found." });

    res.redirect(originalUrl);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`shortleaf running on port ${PORT}`));