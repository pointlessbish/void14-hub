// src/pages/api/live.js

export async function GET() {
  // 1. Your full list of collective members
  const memberLogins = [
    'pointlessbish', 
    'sog78', 
    'mothmxnch', 
    'cantdropsoap', 
    'dacobra1990', 
    'radiatorpapi', 
    'mrwatson_gaming', 
    'srvent_', 
    'theonegree', 
    'adventure_skittzy'
  ];

  // 2. Secret Credentials (Stored in Cloudflare/Environment)
  const client_id = import.meta.env.TWITCH_CLIENT_ID;
  const client_secret = import.meta.env.TWITCH_CLIENT_SECRET;

  try {
    // A. Get the Access Token from Twitch
    const tokenResponse = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`,
      { method: 'POST' }
    );
    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    // B. Create the query string for all members
    const userQuery = memberLogins.map(login => `login=${login}`).join('&');
    const streamQuery = memberLogins.map(login => `user_login=${login}`).join('&');

    // C. Fetch User Data (Profiles/Avatars) and Stream Data (Live status/Viewers)
    const [usersRes, streamsRes] = await Promise.all([
      fetch(`https://api.twitch.tv/helix/users?${userQuery}`, {
        headers: { 'Client-ID': client_id, 'Authorization': `Bearer ${access_token}` }
      }),
      fetch(`https://api.twitch.tv/helix/streams?${streamQuery}`, {
        headers: { 'Client-ID': client_id, 'Authorization': `Bearer ${access_token}` }
      })
    ]);

    const usersData = await usersRes.json();
    const streamsData = await streamsRes.json();

    // D. Return the data to your frontend
    return new Response(JSON.stringify({
      users: usersData.data || [],
      streams: streamsData.data || []
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch from the Void" }), { 
      status: 500 
    });
  }
}