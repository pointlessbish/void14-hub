// src/lib/twitch.js

/**
 * Gets a temporary App Access Token from Twitch.
 * Uses your Client ID and Secret from the environment.
 */
async function getAppToken(env) {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: env.TWITCH_CLIENT_ID,
            client_secret: env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
        })
    });

    const data = await response.json();
    
    if (!data.access_token) {
        throw new Error(`Twitch Auth Failed: ${data.message || 'Check your ID and Secret'}`);
    }
    
    return data.access_token;
}

/**
 * Fetches the Profile Picture for 'nekorebby'.
 * No fallback - will throw a visible error if it fails.
 */
export async function getTwitchPFP(env) {
    const token = await getAppToken(env);
    
    const response = await fetch(`https://api.twitch.tv/helix/users?login=nekorebby`, {
        headers: {
            'Client-ID': env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`
        }
    });

    const json = await response.json();

    if (!json.data || json.data.length === 0) {
        throw new Error("Twitch User 'nekorebby' not found.");
    }

    return json.data[0].profile_image_url;
}

/**
 * Security helper for future webhook use.
 */
export async function verifySignature(headers, body, secret) {
    const id = headers.get('Twitch-Eventsub-Message-Id');
    const timestamp = headers.get('Twitch-Eventsub-Message-Timestamp');
    const signature = headers.get('Twitch-Eventsub-Message-Signature');

    if (!id || !timestamp || !signature) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', 
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false, 
        ['sign']
    );

    const data = encoder.encode(id + timestamp + body);
    const sigBuffer = await crypto.subtle.sign('HMAC', key, data);
    
    const expectedSignature = 'sha256=' + Array.from(new Uint8Array(sigBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return expectedSignature === signature;
}