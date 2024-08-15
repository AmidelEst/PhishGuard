// src/utils/urlToHashContent.js
const fetch = require('node-fetch'); // fetch static pages
const puppeteer = require('puppeteer'); // fetch dynamic pages
const cheerio = require('cheerio'); // run over DOM by properties
const crypto = require('crypto'); // utilize a hash function

// removing URL fragments
function normalizeUrl(url) {
	try {
		const normalizedUrl = new URL(url);
		normalizedUrl.hash = '';
		return normalizedUrl.toString();
	} catch (e) {
		console.error(`Invalid URL: ${url}`);
		return null;
	}
}
// Fetch HTML using node-fetch
async function fetchHTMLWithFetch(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const html = await response.text();
		return html;
	} catch (error) {
		console.error(`Fetch error for URL: ${url}\nError: ${error.message}`);
		return null;
	}
}

// Fetch HTML using Puppeteer
async function fetchHTMLWithPuppeteer(url) {
	try {
		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();
		await page.goto(url, { waitUntil: 'networkidle2' });

		const content = await page.content();
		await browser.close();
		return content;
	} catch (error) {
		console.error(`Puppeteer error: ${error.message} for URL: ${url}`);
		return null;
	}
}

// DOM Extraction from HTML
function extractContent(html, url) {
	const $ = cheerio.load(html);
	$('style').remove(); //* param effects score

	$('script').each((i, elem) => {
		const scriptContent = $(elem).html();
		const maxLength = 400; // Set a maximum length for script content
		if (scriptContent.length > maxLength) {
			$(elem).text(scriptContent.substring(0, maxLength) + '...');
		}
	});

	const bodyText = $('body').text().replace(/\s+/g, ' ').trim().toLowerCase();
	if (bodyText.length === 0) {
		console.error(`\nFetch error: No text content extracted for: ${url}`);
		return null;
	}

	return bodyText;
}

// GLOBAL fetch function
//* try to first fetch HTML using fetch
//! if fetch fails -> try fetch using Puppeteer
async function fetchHTML(url) {
	const fetchHtml = await fetchHTMLWithFetch(url);
	if (fetchHtml) {
		const extractedContent = extractContent(fetchHtml, url);
		if (extractedContent) {
			return fetchHtml;
		} else {
			console.log(`Rolling back Puppeteer for URL: ${url}.\n`);
		}
	} else {
		console.log(`Rolling back Puppeteer for URL: ${url}.\n\n`);
	}
	return fetchHTMLWithPuppeteer(url);
}

// Normalize DOM's text by removing punctuation and extra spaces
function normalizeText(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

// Generate shingles from text
function getShingles(text, shingleSize = 3) {
	const shingles = new Set();
	for (let i = 0; i <= text.length - shingleSize; i++) {
		shingles.add(text.substring(i, i + shingleSize));
	}
	return Array.from(shingles);
}

// Generate MinHash signatures from shingles
function generateMinHash(shingles, numHashes = 200) {
	return Array.from({ length: numHashes }, (_, i) => {
		return shingles.reduce((minHash, shingle) => {
			const hashValue = parseInt(
				crypto
					.createHash('sha256')
					.update(shingle + i)
					.digest('hex')
					.substring(0, 6),
				16
			);
			return Math.min(minHash, hashValue);
		}, Infinity);
	});
}

// GLOBAL FUNCTION - Compress and hash HTML content
async function compressAndHashHTML(url) {
	const normalizedUrl = normalizeUrl(url);
	if (!normalizedUrl) return null;

	const html = await fetchHTML(normalizedUrl);
	if (!html) {
		console.error(`Failed to fetch HTML for URL: ${url}`);
		return null;
	}

	const content = extractContent(html, url);
	if (!content) {
		console.error(`Failed to extract content from HTML for URL: ${url}`);
		return null;
	}

	const normalizedContent = normalizeText(content);
	if (!normalizedContent) {
		console.error(`Failed to normalize content from HTML for URL: ${url}`);
		return null;
	}

	const shingles = getShingles(normalizedContent);
	if (!shingles.length) {
		console.error(`Failed to generate shingles for URL: ${url}`);
		return null;
	}

	const minHash = generateMinHash(shingles);
	if (!minHash.length) {
		console.error(`Failed to generate MinHash for URL: ${url}`);
		return null;
	}

	return { url, minHash, content: normalizedContent, shingles };
}

module.exports = {
	normalizeUrl,
	fetchHTML,
	extractContent,
	normalizeText,
	getShingles,
	generateMinHash,
	compressAndHashHTML,
};
