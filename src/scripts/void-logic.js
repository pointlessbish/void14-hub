// src/scripts/void-logic.js

const socialConfig = {
    'pointlessbish': { youtube: '@pointlessbish', discord: 'eyQR6AfGGh' },
    'sog78': { youtube: '@sog78', tiktok: 'sogchanka' },
    'mothmxnch': { youtube: '@mothmxnch' },
    'cantdropsoap': { tiktok: 'cantdropsoap' },
    'dacobra1990': { youtube: '@CobraGaming-b3o', tiktok: 'dacobra1990' },
    'radiatorpapi': { youtube: '@radiatorpapi', tiktok: 'radiatorpapi' },
    'mrwatson_gaming': { tiktok: 'lukechicago' }, 
    'srvent_': {},
    'nebbay': {},
    'theonegree': {},
    'adventure_skittzy': {},
    'mahzzi_':{youtube:'@MahzziStreams', tiktok: 'mahzzistreams'},
};

const masterOrder = [
    'pointlessbish', 'sog78', 'mothmxnch', 'cantdropsoap',
    'dacobra1990', 'mahzzi_', 'adventure_skittzy', 'srvent_',
    'mrwatson_gaming', 'radiatorpapi', 'theonegree', 'nebbay'
];

function calculateUptime(startTime) {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export async function refreshVoid() {
    try {
        const workerUrl = 'https://api.void14.wtf'; 
        
        const res = await fetch(`${workerUrl}?t=${Date.now()}`);
        
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        
        const { streams, users } = await res.json();
        
        if (!users || users.length === 0) return;

        const container = document.getElementById('member-list');
        const streamDataMap = {};
        streams.forEach(s => streamDataMap[s.user_login.toLowerCase()] = s);

        const sortedUsers = users.sort((a, b) => {
            const aLogin = a.login.toLowerCase();
            const bLogin = b.login.toLowerCase();
            const aStream = streamDataMap[aLogin];
            const bStream = streamDataMap[bLogin];

            if (aStream && !bStream) return -1;
            if (!aStream && bStream) return 1;
            if (aStream && bStream) {
                if (aLogin === 'pointlessbish') return -1;
                if (bLogin === 'pointlessbish') return 1;
                return bStream.viewer_count - aStream.viewer_count;
            }
            return masterOrder.indexOf(aLogin) - masterOrder.indexOf(bLogin);
        });

        container.innerHTML = sortedUsers.map((user, index) => {
            const login = user.login.toLowerCase();
            const live = streamDataMap[login];
            const extras = socialConfig[login] || {};
            const isTopLive = (index === 0 && live);
            
            let statusHTML = 'Offline';
            if (live) {
                const uptime = calculateUptime(live.started_at);
                statusHTML = `
                    <i class="fab fa-twitch"></i> LIVE 
                    <span class="separator">|</span> 
                    <i class="fas fa-user"></i> ${live.viewer_count.toLocaleString()} 
                    <span class="separator">|</span> 
                    <i class="fas fa-clock"></i> ${uptime}
                `;
            }

            return `
                <div class="link-card ${live ? 'is-live' : ''}">
                    <div class="card-header-wrapper">
                        <a href="https://twitch.tv/${login}" target="_blank" class="card-main-link" style="--profile-pic: url(${user.profile_image_url})">
                            <div class="member-info">
                                <div class="member-name">${user.display_name}</div>
                                <span class="status ${live ? 'live' : ''}">${statusHTML}</span>
                            </div>
                        </a>
                        <div class="socials-row">
                            <a href="https://twitch.tv/${login}" target="_blank" class="social-icon twitch"><i class="fab fa-twitch"></i></a>
                            ${extras.youtube ? `<a href="https://youtube.com/${extras.youtube}" target="_blank" class="social-icon youtube"><i class="fab fa-youtube"></i></a>` : ''}
                            ${extras.tiktok ? `<a href="https://tiktok.com/@${extras.tiktok}" target="_blank" class="social-icon tiktok"><i class="fab fa-tiktok"></i></a>` : ''}
                            ${extras.discord ? `<a href="https://discord.gg/${extras.discord}" target="_blank" class="social-icon discord"><i class="fab fa-discord"></i></a>` : ''}
                        </div>
                    </div>
                    ${isTopLive ? `
                        <a href="https://twitch.tv/${login}" target="_blank" class="stream-thumb-link">
                            <img src="https://static-cdn.jtvnw.net/previews-ttv/live_user_${login}-440x248.jpg?t=${Date.now()}" class="stream-thumb" />
                        </a>
                    ` : ''}
                </div>`;
        }).join('');
    } catch (e) { 
        console.error("Void Fetch Error", e); 
    }
}

export function initGlitch() {
    const titleElement = document.getElementById('glitch-title');
    if (!titleElement) return;
    const originalText = "VOID14";
    const glitchChars = "X01V/";
    setInterval(() => {
        if (Math.random() > 0.34) {
            titleElement.innerText = originalText.split('').map(char => 
                Math.random() > 0.8 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
            ).join('');
            setTimeout(() => { titleElement.innerText = originalText; }, 120);
        }
    }, 400);
}

// Initializing
initGlitch();
refreshVoid();
setInterval(refreshVoid, 60000); // 1 minute refresh