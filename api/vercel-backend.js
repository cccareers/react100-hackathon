import express from 'express';
import cors from 'cors';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import { MongoClient } from 'mongodb';

const app = express();
app.use(cors());
let browser;

//get api keys from .env
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
const rapidapiKey = process.env.VITE_STREAMING_AVAILABILITY_API_KEY;
rapidapiKey ? console.log("Streaming Availability key is loaded") : console.log("Failed Streaming Availability key loading");
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;
async function connectToDatabase()
{
    if (!db)
    {
        await client.connect();
        db = client.db('movie_app'); // Your database name
        console.log("🍃 Connected to MongoDB");
    }
    return db;
}

const cleanScrapedTitle = (title) =>
{
    if (!title) return "";

    // 1. Specific removals for common "junk" patterns
    let cleaned = title
        .replace(/Amazon\.com: /i, '')
        .replace(/\| Prime Video/i, '')
        .replace(/\| Hulu/i, '')
        .replace(/ - Apple TV/i, '')
        .replace(/ - Netflix/i, '')
        .replace(/\| Netflix/i, '');

    // 2. The "Smart Dash" removal
    // We only want to split and drop the second half if it's a known service name.
    // If it's something like "Extended Edition", we keep it.
    const parts = cleaned.split(' - ');

    if (parts.length > 1)
    {
        const lastPart = parts[parts.length - 1].toLowerCase();
        const serviceNames = ['prime video', 'hulu', 'netflix', 'disney+', 'hbo max', 'max', 'apple tv', 'paramount+'];

        // If the last part is a service name, remove it. Otherwise, put the dash back!
        if (serviceNames.some(service => lastPart.includes(service)))
        {
            cleaned = parts.slice(0, -1).join(' - ');
        }
    }

    return cleaned.trim();
};

let isLaunching = false;
async function getBrowserInstance()
{
    // If another request is already launching, wait a tiny bit
    while (isLaunching) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // On Vercel, we use the light chromium binary
    isLaunching = true;
    try {
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        return browser;
    } finally {
        isLaunching = false;
    }
}

async function initBrowser()
{
    console.log('🚀 Launching Persistent Browser...');
    browser = await getBrowserInstance();
    console.log('✅ Browser Ready');
}

app.get('/api/streaming-info', async (req, res) =>
{
    const { url, media_type, tmdbId } = req.query;
    if (!tmdbId) return res.status(400).json({ error: 'tmdbId is required' });
    if (!url)
        console.log("No URL provided, skipping fast paths");

    let extractedTitle = null;

    // --- FAST PATH: URL PARSING ---
    if(url)
    {
    if (url.includes('hulu.com/movie/'))
    {
        const slug = url.split('/movie/')[1];
        const parts = slug.split('-');
        extractedTitle = parts.slice(0, -5).join(' ');
    }
    else if (url.includes('tv.apple.com/') && url.includes('/movie/'))
    {
        // Split by /movie/, take the second part, then split by / to get the title slug
        const slug = url.split('/movie/')[1].split('/')[0];
        extractedTitle = slug.replace(/-/g, ' ');
    }
    else if (url.includes('crunchyroll.com/series/'))
    {
        // Example: /series/GZJH3DPK0/blade-runner-black-lotus
        const parts = url.split('/series/')[1].split('/');
        // parts[0] is the ID (GZJH3DPK0), parts[1] is the title slug
        if (parts[1])
        {
            extractedTitle = parts[1].replace(/-/g, ' ');
        } else
        {
            // Sometimes URLs don't have the slug at the end, just the ID
            // In this case, we'll let it fall through to Puppeteer
            extractedTitle = null;
        }
    }
    }

    // --- FORMAT & RETURN IF SUCCESSFUL ---
    if (extractedTitle)
    {
        const cleanTitle = decodeURIComponent(extractedTitle)
            .replace(/-/g, ' ') // Standardize dashes to spaces
            // This regex finds the first letter of every word, even after ( or [
            .replace(/(^\w|\s\w|[\(\[]\w)/g, m => m.toUpperCase());

        console.log('🚀 Fast Path Success:', cleanTitle);
        return res.json({ title: cleanTitle, source: 'url-parse' });
    }

    try
    {
        const db = await connectToDatabase();
        const collection = db.collection('streaming_cache');

        // 1. Check MongoDB instead of fs.readFileSync
        const cachedData = await collection.findOne({ tmdbId });

        if (cachedData)
        {
            console.log(`📦 MongoDB Cache Hit: ${tmdbId}`);
            return res.json(cachedData);
        }

        // 2. If not in DB, fetch from RapidAPI
        console.log(`🌐 Cache Miss. Calling RapidAPI for: ${tmdbId}`);
        const options = {
            method: "GET",
            url: `https://streaming-availability.p.rapidapi.com/shows/${media_type}/${tmdbId}`,
            headers: {
                "x-rapidapi-key": rapidapiKey,
                "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
            },
        };

        const apiResponse = await axios.request(options);
        const freshData = apiResponse.data;
        const freshObject = {timestamp: Date.now(), data: freshData};

        // 3. Save to MongoDB instead of fs.writeFileSync
        await collection.updateOne(
            { tmdbId },
            { $set: freshObject },
            { upsert: true }
        );
        console.log("retrieved data from streaming api");
        return res.json(freshObject);

    } catch (err)
    {
        console.error("Database or API Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

const getTitlesCache = async (url) =>
{
    const database = await connectToDatabase();
    const result = await database.collection('titles_cache').findOne({ url });
    return result ? result.title : null;
};

const setTitlesCache = async (url, title) =>
{
    const database = await connectToDatabase();
    await database.collection('titles_cache').updateOne(
        { url },
        { $set: { url, title } },
        { upsert: true }
    );
};

// --- THE SCRAPER ---
app.get('/api/scrape', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    // 1. Check MongoDB Cache first
    const cached = await getTitlesCache(url);
    if (cached) return res.json({ title: cached, source: 'cache' });

    // 2. FAST PATHS: URL Parsing (No Browser Needed)
    let extractedTitle = null;

    if (url.includes('hulu.com/movie/')) {
        const slug = url.split('/movie/')[1];
        extractedTitle = slug.split('-').slice(0, -5).join(' ');
    } 
    else if (url.includes('tv.apple.com/') && url.includes('/movie/')) {
        extractedTitle = url.split('/movie/')[1].split('/')[0].replace(/-/g, ' ');
    } 
    else if (url.includes('crunchyroll.com/series/')) {
        const parts = url.split('/series/')[1].split('/');
        if (parts[1]) extractedTitle = parts[1].replace(/-/g, ' ');
    }
    // Amazon Fast Path (only works if slug is present before the ID)
    else if (url.includes('amazon.com')) {
        const parts = url.split('/detail/');
        if (parts[1]) {
            const slug = parts[1].split('/')[0];
            // Check if slug looks like a title and not a random ID (IDs usually start with 0M or B0)
            if (!slug.startsWith('0M') && !slug.startsWith('B0') && slug.includes('-')) {
                extractedTitle = slug.replace(/-/g, ' ');
            }
        }
    }

    // If a Fast Path matched, format and return immediately
    if (extractedTitle) {
        const cleanTitle = decodeURIComponent(extractedTitle)
            .replace(/(^\w|\s\w|[\(\[]\w)/g, m => m.toUpperCase());
        
        // Cache it for next time!
        await setTitlesCache(url, cleanTitle);
        return res.json({ title: cleanTitle, source: 'url-parse' });
    }

    // 3. SLOW PATH: Puppeteer Scraper (Only runs if Fast Path fails)
    let browserInstance = null;
    let page = null;

    try {
        browserInstance = await getBrowserInstance();
        page = await browserInstance.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media', 'script'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });

        const rawTitle = await page.evaluate(() => {
            const amzTitle = document.querySelector('h1[data-automation-id="title"]')?.innerText;
            const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
            return amzTitle || ogTitle || document.title;
        });

        const cleanTitle = cleanScrapedTitle(rawTitle);

        if (cleanTitle && cleanTitle !== "Amazon.com") {
            await setTitlesCache(url, cleanTitle);
        }

        res.json({ title: cleanTitle, source: 'puppeteer' });

    } catch (error) {
        console.error("Scrape Crash:", error.message);
        res.status(500).json({ error: "Scrape failed", details: error.message });
    } finally {
        if (page) await page.close();
        if (browserInstance) await browserInstance.close();
    }
});

export default app;
