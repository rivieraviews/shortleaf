import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';

const app = express();
app.use(cors());
app.use(express.json());

const urlDatabase = new Map();

app.post('/shorten', (req, res) => {
    const { originalUrl } = req.body;
    if (!originalUrl)
        return res.status(400).json({ error: "originalUrl required." });

    const shortId = nanoid(6);
    urlDatabase.set(shortId, originalUrl);

    const shortUrl = `${req.protocol}://${req.get("host")}/${shortId}`;
    res.json({ shortUrl });
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