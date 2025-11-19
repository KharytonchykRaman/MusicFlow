require('dotenv').config();
const express = require('express');
const https = require('https');
const querystring = require('querystring');

const app = express();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Encode credentials for Basic Auth
const encodedCredentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

// Function to get access token
function getAccessToken() {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      'grant_type': 'client_credentials'
    });

    const options = {
      hostname: 'accounts.spotify.com',
      port: 443,
      path: '/api/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.access_token);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Endpoint to search tracks
app.get('/tracks', async (req, res) => {
  try {
    const token = await getAccessToken();

    const genre = req.query.genre || 'pop';
    const limit = req.query.limit || 5;

    const params = querystring.stringify({
      q: `genre:${genre}`,
      type: 'track',
      limit: limit
    });

    const options = {
      hostname: 'api.spotify.com',
      port: 443,
      path: `/v1/search?${params}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          res.json(JSON.parse(data));
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse response' });
        }
      });
    });

    request.on('error', (e) => {
      res.status(500).json({ error: 'Request failed' });
    });

    request.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

app.get('/', (req, res) => {
    res.send(`
      <h1>🎵 MusicFlow Backend</h1>
      <audio src="spotify:artist:1oSPZhvZMIrWW5I41kPkkY">123</audio>
      <p>Server is running!</p>
      <ul>
        <li><a href="/tracks?genre=pop&limit=3">Get tracks</a></li>
      </ul>
    `);
  });

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});