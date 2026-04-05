const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    PHONENUMBER_MCC,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const readline = require('readline');

const logger = pino({ level: 'silent' });

// ─────────────────────────────────────────
// Tanya nomor HP lewat terminal
// ─────────────────────────────────────────
async function tanyaNomor() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        console.log('\n╔══════════════════════════════════════════╗');
        console.log('║       🤖 SQ DR WELCOME BOT v4.0          ║');
        console.log('╚══════════════════════════════════════════╝\n');
        console.log('📌 Login menggunakan Pairing Code\n');
        rl.question('📱 Masukkan nomor WA bot (contoh: 6282157298268): ', (input) => {
            rl.close();
            // Hapus karakter non-angka & strip leading +
            const nomor = input.replace(/[^0-9]/g, '');
            resolve(nomor);
        });
    });
}

// ─────────────────────────────────────────
// Mulai bot
// ─────────────────────────────────────────
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,   // Matikan QR sepenuhnya
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        browser: ['Ubuntu', 'Chrome', '120.0.6099.71'],
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: false,
    });

    // ── Pairing Code ──────────────────────────────
    if (!sock.authState.creds.registered) {
        const nomor = await tanyaNomor();

        if (!nomor || nomor.length < 8) {
            console.log('\n❌ Nomor tidak valid! Jalankan ulang.\n');
            process.exit(1);
        }

        // Tunggu socket siap sebelum minta kode (penting!)
        await new Promise(r => setTimeout(r, 2000));

        try {
            const code = await sock.requestPairingCode(nomor);
            // Format jadi XXXX-XXXX
            const formatted = code?.match(/.{1,4}/g)?.join('-') ?? code;

            console.log('\n╔══════════════════════════════════════════╗');
            console.log('║         🔑 PAIRING CODE KAMU             ║');
            console.log('╠══════════════════════════════════════════╣');
            console.log(`║  Kode  :  ${formatted.padEnd(31)}║`);
            console.log('╚══════════════════════════════════════════╝');
            console.log('\n📋 Cara memasukkan kode:');
            console.log('   1. Buka WhatsApp di HP kamu');
            console.log('   2. Tap ⋮ (titik tiga) pojok kanan atas');
            console.log('   3. Pilih "Perangkat Tertaut"');
            console.log('   4. Tap "Tautkan Perangkat"');
            console.log('   5. Tap "Tautkan dengan nomor telepon"');
            console.log(`   6. Masukkan kode → ${formatted}`);
            console.log('\n⚠️  Kode expired dalam beberapa menit.');
            console.log('    Kalau expired, jalankan ulang: node index.js\n');
        } catch (err) {
            console.error('\n❌ Gagal generate pairing code:', err.message);
            console.log('💡 Tips: Pastikan nomor aktif di WhatsApp & format 628xxx\n');
            process.exit(1);
        }
    }

    sock.ev.on('creds.update', saveCreds);

    // ── Status koneksi ────────────────────────────
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error instanceof Boom)
                ? lastDisconnect.error.output.statusCode
                : 0;

            const reconnect = statusCode !== DisconnectReason.loggedOut;
            console.log(`\n🔌 [${getTime()}] Koneksi putus — ${lastDisconnect?.error?.message ?? 'unknown'}`);

            if (reconnect) {
                console.log('🔄 Reconnecting dalam 5 detik...\n');
                setTimeout(startBot, 5000);
            } else {
                console.log('❌ Logged out!\n');
                console.log('   Jalankan: rm -rf auth_info && node index.js\n');
                process.exit(0);
            }
        }

        if (connection === 'open') {
            console.clear();
            console.log('\n╔══════════════════════════════════════════╗');
            console.log('║   ✅  BOT SQ DR BERHASIL TERHUBUNG!  ✅  ║');
            console.log('╚══════════════════════════════════════════╝');
            console.log('\n🟢 Bot aktif — siap menyambut anggota baru');
            console.log('🔴 CTRL+C untuk matikan bot\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📋 LOG AKTIVITAS:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
    });

    // ── Welcome anggota baru ──────────────────────
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        if (action !== 'add') return;

        try {
            const groupMeta = await sock.groupMetadata(id);
            const groupName  = groupMeta.name;
            const totalMember = groupMeta.participants.length;

            for (const participant of participants) {
                const userNumber = participant.split('@')[0];

                const welcomeMessage =
`╔════════════════════════════╗
║   🌟 *WELCOME TO SQ DR* 🌟   ║
╚════════════════════════════╝

Assalamu'alaikum Warahmatullahi Wabarakatuh 🤲

Selamat datang, @${userNumber}! 🎉

Kami sangat senang menyambut kamu sebagai bagian dari keluarga besar *Squad DR (SQ DR)* 💪✨

━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *INFORMASI GRUP*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 Grup       : *${groupName}*
🏅 Member ke  : *${totalMember}*
📅 Bergabung  : *${getFormattedDate()}*

━━━━━━━━━━━━━━━━━━━━━━━━━━
📜 *PERATURAN GRUP*
━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ Saling menghormati sesama anggota
2️⃣ Dilarang spam & promosi tanpa izin
3️⃣ Gunakan bahasa yang sopan & santun
4️⃣ Dilarang share konten negatif/SARA
5️⃣ Tetap jaga kerukunan & kekompakan

━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 Jangan ragu untuk berkenalan dengan anggota lainnya ya! 😊

Semoga betah & nyaman di sini! 🏡
Bersama *SQ DR*, kita lebih kuat! 💪🔥

_Bot by SQ DR_ 🤖`;

                await sock.sendMessage(id, {
                    text: welcomeMessage,
                    mentions: [participant],
                });

                console.log(`✅ [${getTime()}] Welcome → @${userNumber} | Grup: "${groupName}"`);
            }
        } catch (err) {
            console.error(`❌ [${getTime()}] Gagal kirim welcome:`, err.message);
        }
    });
}

// ─────────────────────────────────────────
// Helper
// ─────────────────────────────────────────
function getFormattedDate() {
    const now = new Date();
    const days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

function getTime() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

startBot();
