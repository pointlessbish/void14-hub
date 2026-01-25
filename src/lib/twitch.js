// src/lib/twitch.js
export async function verifySignature(headers, body, secret) {
  const id = headers.get('Twitch-Eventsub-Message-Id');
  const timestamp = headers.get('Twitch-Eventsub-Message-Timestamp');
  const signature = headers.get('Twitch-Eventsub-Message-Signature');

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );

  const data = encoder.encode(id + timestamp + body);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, data);
  const expected = 'sha256=' + Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  return expected === signature;
}

export async function sendChat(broadcasterId, message, env) {
  // Logic to fetch your stored Bot Token and POST to Twitch Helix
  return fetch('https://api.twitch.tv/helix/chat/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.BOT_OAUTH_TOKEN}`,
      'Client-Id': env.TWITCH_CLIENT_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      broadcaster_id: broadcasterId,
      sender_id: env.BOT_USER_ID,
      message: message
    })
  });
}