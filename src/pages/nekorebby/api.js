// src/pages/nekorebby/api.js
import { verifySignature } from '../../lib/twitch';

export const POST = async ({ request, locals }) => {
    const { env } = locals.runtime;
    const bodyText = await request.text();
    const headers = request.headers;

    // 1. Security check: Is this REALLY Twitch?
    // This uses the verifySignature function we wrote earlier
    const isValid = await verifySignature(headers, bodyText, env.TWITCH_WEBHOOK_SECRET);
    if (!isValid) return new Response('Unauthorized', { status: 403 });

    const json = JSON.parse(bodyText);
    const msgType = headers.get('Twitch-Eventsub-Message-Type');

    // 2. The Handshake (Twitch verification)
    // When you first sign up, Twitch sends a "challenge" string. 
    // You MUST send it back exactly to activate the bot.
    if (msgType === 'webhook_callback_verification') {
        console.log("Nekorebby Protocol: Webhook Verified.");
        return new Response(json.challenge, { status: 200 });
    }

    // 3. Handle Actual Events
    if (msgType === 'notification') {
        const { event, subscription } = json;

        // Logic for Chat Messages
        if (subscription.type === 'channel.chat.message') {
            const user = event.chatter_user_name;
            const message = event.message.text.trim();

            console.log(`[VOID-CHAT] ${user}: ${message}`);

            // COMMAND: !void
            if (message.toLowerCase() === '!void') {
                // We will add 'sendChat' here in the next step!
                console.log("Command Triggered: !void");
            }
        }
    }

    return new Response('OK', { status: 200 });
};