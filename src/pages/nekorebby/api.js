import { verifySignature } from '../../lib/twitch'; // We'll make this next

export const POST = async ({ request, locals }) => {
  const { env } = locals.runtime;
  const bodyText = await request.text();
  const headers = request.headers;

  // 1. Verify Security (Crucial so no one fakes events)
  if (!await verifySignature(headers, bodyText, env.TWITCH_WEBHOOK_SECRET)) {
    return new Response('Unauthorized', { status: 403 });
  }

  const json = JSON.parse(bodyText);
  const msgType = headers.get('Twitch-Eventsub-Message-Type');

  // 2. Handle the Twitch "Challenge" (Verification handshake)
  if (msgType === 'webhook_callback_verification') {
    return new Response(json.challenge, { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain' } 
    });
  }

  // 3. Handle Actual Events (Chat, Follows, etc.)
  if (msgType === 'notification') {
    const event = json.event;
    const subType = json.subscription.type;

    // Example Action: Respond to Chat
    if (subType === 'channel.chat.message') {
      if (event.message.text.toLowerCase().includes('!nekorebby')) {
        await replyToChat(event.broadcaster_user_id, "🐾 Nekorebby is online! Nya!", env);
      }
    }
    
    // Example Action: Ping Overlay (Ably)
    if (subType === 'channel.follow') {
        // Code to send data to your overlay.astro page via Ably goes here
    }
  }

  return new Response('OK', { status: 200 });
};

async function replyToChat(broadcasterId, message, env) {
  await fetch('https://api.twitch.tv/helix/chat/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.BOT_ACCESS_TOKEN}`,
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