const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const chalk = require("chalk")

async function startBot() {
    console.clear()
    console.log(chalk.cyan(`
╔══════════════════════════════╗
║     WA PAIRING SYSTEM       ║
║      PROJECT SEKOLAH        ║
╚══════════════════════════════╝
`))

    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    })

    // Generate pairing code resmi
    if (!sock.authState.creds.registered) {
        const phoneNumber = "62XXXXXXXXXX" // GANTI NOMOR KAMU

        console.log(chalk.yellow("⏳ Mengambil pairing code...\n"))

        const code = await sock.requestPairingCode(phoneNumber)

        console.log(chalk.green("✅ PAIRING CODE BERHASIL DIBUAT\n"))
        console.log(chalk.bgBlack.white(`   ${code}   `))
        console.log(chalk.gray("\nMasukkan kode ini di WhatsApp kamu"))
        console.log(chalk.gray("Menu: Perangkat Tertaut > Tautkan dengan nomor\n"))
    }

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        if (update.connection === "open") {
            console.log(chalk.green("\n🚀 BOT TERHUBUNG KE WHATSAPP!"))
        }
    })
}

startBot()
