# 🤖 WhatsApp Welcome Bot — SQ DR v4.0

Bot WhatsApp otomatis untuk menyambut anggota baru di grup **Squad DR (SQ DR)**.
Login pakai **Pairing Code** — tidak perlu scan QR!

---

## 📱 Cara Install di Termux

```bash
# 1. Update Termux
pkg update && pkg upgrade -y

# 2. Install Node.js & Git
pkg install -y nodejs git

# 3. Clone repo
git clone https://github.com/Hironi645/Bot-devil.git
cd Bot-devil

# 4. Install paket
npm install

# 5. Jalankan bot
node index.js
```

---

## 🔑 Cara Login Pairing Code

Setelah `node index.js`, bot minta nomor:
```
📱 Masukkan nomor WA bot (contoh: 6282157298268):
```
Ketik nomor → bot tampilkan kode **XXXX-XXXX**

Lalu di WhatsApp:
1. Tap **⋮** → **Perangkat Tertaut**
2. **Tautkan Perangkat**
3. **Tautkan dengan nomor telepon**
4. Masukkan kode 8 digit ✅

---

## 🔄 Login Ulang

```bash
rm -rf auth_info
node index.js
```

---

## 🌙 Jalankan di Background

```bash
pkg install tmux -y
tmux new -s sqdr
node index.js
# Keluar tanpa matikan: CTRL+B lalu D
# Kembali: tmux attach -t sqdr
```

---

## ⚠️ Penting

- Bot **harus jadi Admin** di grup
- Gunakan **nomor khusus** untuk bot
- Format nomor: `628xxxxxxxxx` (tanpa + dan tanpa 0 di depan)
