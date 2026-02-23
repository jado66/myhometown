/**
 * Gmail OAuth2 Refresh Token Generator
 * 
 * This script helps you generate refresh tokens for Gmail OAuth2 authentication.
 * Run this script twice - once for each Gmail account.
 */

import readline from 'readline';
import { google } from 'googleapis';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const CLIENT_ID = process.env.CS_GMAIL_CLIENT_ID || process.env.MHT_GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.CS_GMAIL_CLIENT_SECRET || process.env.MHT_GMAIL_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: Missing CLIENT_ID or CLIENT_SECRET in environment variables');
  console.error('Make sure your .env.local file has CS_GMAIL_CLIENT_ID and CS_GMAIL_CLIENT_SECRET');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

async function generateRefreshToken() {
  console.log('\n=================================================');
  console.log('Gmail OAuth2 Refresh Token Generator');
  console.log('=================================================\n');

  // Generate authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://mail.google.com/'],
    prompt: 'consent'
  });

  console.log('STEP 1: Authorize this app');
  console.log('Copy and paste this URL into your browser:\n');
  console.log(authUrl);
  console.log('\n');
  console.log('STEP 2: Sign in with the Gmail account you want to use');
  console.log('        (info@citiesstrong.org or volunteer@myhometownut.com)');
  console.log('\n');
  console.log('STEP 3: After granting permission, you\'ll be redirected to a');
  console.log('        blank page. Copy the ENTIRE URL from your browser\'s address bar.');
  console.log('        It will look like: http://localhost?code=XXXXXXX&scope=...');
  console.log('\n');

  const redirectedUrl = await question('Paste the FULL redirect URL here: ');

  try {
    // Extract the authorization code from the URL
    const url = new URL(redirectedUrl);
    const code = url.searchParams.get('code');

    if (!code) {
      console.error('\n❌ Error: No authorization code found in URL');
      console.error('Make sure you copied the ENTIRE URL from the browser');
      rl.close();
      return;
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ Success! Here are your tokens:\n');
    console.log('=================================================');
    console.log('REFRESH TOKEN (save this in your .env.local):');
    console.log('=================================================');
    console.log(tokens.refresh_token);
    console.log('=================================================\n');

    console.log('Copy this refresh token and add it to your .env.local file.');
    console.log('\nRun this script again to generate a token for your other Gmail account.\n');

  } catch (error) {
    console.error('\n❌ Error getting tokens:', error.message);
    console.error('\nMake sure you copied the correct URL and try again.');
  }

  rl.close();
}

generateRefreshToken();
