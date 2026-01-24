export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // Allows your Astro site to fetch this
      "Content-Type": "application/json",
    };

    const memberLogins = ['pointlessbish', 'sog78', 'mothmxnch', 'cantdropsoap', 'dacobra1990', 'radiatorpapi', 'mrwatson_gaming', 'srvent_', 'theonegree', 'adventure_skittzy'];

    try {
      // 1. Get Twitch Token
      const tokenRes = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${env.TWITCH_CLIENT_ID}&client_secret=${env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, { method: 'POST' });
      const { access_token } = await tokenRes.json();

      // 2. Fetch Users and Streams
      const userQuery = memberLogins.map(l => `login=${l}`).join('&');
      const streamQuery = memberLogins.map(l => `user_login=${l}`).join('&');

      const [uRes, sRes] = await Promise.all([
        fetch(`https://api.twitch.tv/helix/users?${userQuery}`, { headers: { 'Client-ID': env.TWITCH_CLIENT_ID, 'Authorization': `Bearer ${access_token}` } }),
        fetch(`https://api.twitch.tv/helix/streams?${streamQuery}`, { headers: { 'Client-ID': env.TWITCH_CLIENT_ID, 'Authorization': `Bearer ${access_token}` } })
      ]);

      const users = await uRes.json();
      const streams = await sRes.json();

      return new Response(JSON.stringify({ users: users.data || [], streams: streams.data || [] }), { headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
};