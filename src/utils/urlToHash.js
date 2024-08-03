// src/utils/urlToHashContent.js
const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const puppeteer = require('puppeteer');

// Normalize URL by removing fragments
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

// Fetch HTML content using Axios
async function fetchHTMLWithAxios(url) {
	try {
		const response = await axios.get(url);
		return response.data;
	} catch (error) {
		console.error(
			`\naxios error:in setting up request for URL: ${url},\nError: ${error.message}`
		);
		return null;
	}
}

// Fetch HTML content using Puppeteer
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

	// Extract script content with a reasonable length limit
	$('script').each((i, elem) => {
		const scriptContent = $(elem).html();
		//* param effects score
		const maxLength = 400; // Set a maximum length for script content
		if (scriptContent.length > maxLength) {
			$(elem).text(scriptContent.substring(0, maxLength) + '...'); // Truncate long scripts
		}
	});

	const bodyText = $('body').text().replace(/\s+/g, ' ').trim().toLowerCase();
	if (bodyText.length === 0) {
		console.error(`\naxios error: No text content extracted for: ${url}`); // Log first 200 chars of HTML
		return null;
	}

	return bodyText;
}

// Fetch HTML content using Axios first and fallback to Puppeteer if needed
async function fetchHTML(url) {
	const axiosHtml = await fetchHTMLWithAxios(url);
	if (axiosHtml) {
		const extractedContent = extractContent(axiosHtml, url);
		if (extractedContent) {
			return axiosHtml;
		} else {
			console.log(`Rolling back Puppeteer for URL: ${url}.\n`);
		}
	} else {
		console.log(`Rolling back Puppeteer for URL: ${url}.\n\n`);
	}
	return fetchHTMLWithPuppeteer(url);
}

// Normalize text content by removing punctuation and extra spaces
function normalizeText(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

// Generate shingles from text
function getShingles(text, shingleSize = 3) {
	//* param effects score
	const shingles = new Set();
	for (let i = 0; i <= text.length - shingleSize; i++) {
		shingles.add(text.substring(i, i + shingleSize));
	}
	return Array.from(shingles);
}

// Generate MinHash signatures from shingles
function generateMinHash(shingles, numHashes = 200) { //* param effects score
	return Array.from({ length: numHashes }, (_, i) => {
		
		return shingles.reduce((minHash, shingle) => {
			const hashValue = parseInt(
				crypto
					.createHash('sha256')
					.update(shingle + i)
					.digest('hex')
					.substring(0, 6), //* param effects score
				16 //* param effects score
			);
			return Math.min(minHash, hashValue);
		}, Infinity);
	});
}



// Compress and hash HTML content
async function compressAndHashHTML(url) {
	const normalizedUrl = normalizeUrl(url);
	if (!normalizedUrl) return null;

	const html = await fetchHTML(normalizedUrl);
	if (!html) {
		console.error(`Failed to fetch HTML for URL: ${url}`);
		return null;
	}

	const content = extractContent(html);
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

	// console.log(`URL: ${url}, MinHash: ${minHash}`);
	return { url,minHash, content: normalizedContent, shingles };
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
