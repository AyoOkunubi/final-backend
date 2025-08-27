const axios = require('axios');

const endpoint = process.env.TEXT_ANALYTICS_ENDPOINT;
const key = process.env.TEXT_ANALYTICS_KEY;

async function analyzeSentiment(text) {
  if (!endpoint || !key) {
    console.warn('Text Analytics not configured. Skipping sentiment analysis.');
    return { label: 'unknown', score: null };
  }
  const url = `${endpoint}/text/analytics/v3.1/sentiment`;
  const body = { documents: [{ id: '1', language: 'en', text }] };
  const headers = { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/json' };
  try {
    const { data } = await axios.post(url, body, { headers });
    const doc = data.documents?.[0];
    if (!doc) return { label: 'unknown', score: null };
    const label = doc.sentiment;
    const score = doc.confidenceScores?.positive ?? null;
    return { label, score };
  } catch (e) {
    console.error('Sentiment API error:', e?.response?.data || e.message);
    return { label: 'error', score: null };
  }
}

module.exports = { analyzeSentiment };
