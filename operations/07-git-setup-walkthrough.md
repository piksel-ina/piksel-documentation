# Setup akun Git di development instance

|         |                           |
| :------ | :------------------------ |
| Version | 1.0                       |
| Date    | 12 January 2026           |
| Owner   | Cloud Infrastructure Team |

## Informasi Awal

> Pastikan `user.name` dan `user.email` sesuai akun GitHub kamu.

### 1. Identitas Git

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### 2. Default yang disarankan

```bash
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global fetch.prune true
```

## SSH (untuk akses repo tanpa password)

### 3. Generate key + daftarkan ke agent

```bash
ssh-keygen -t ed25519 -C "you@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### 4. Tambahkan SSH key ke GitHub (langkah di GitHub)

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy public key, Lalu buka **GitHub → Settings → SSH and GPG keys → New SSH key** → paste.

### 5. Test koneksi

```bash
ssh -T git@github.com
```

### 6. Test Clone Repo Piksel dengan SSH

```bash
git clone git@github.com:piksel-ina/piksel-core.git
```

## GPG (untuk signed/verified commit)

### 7. Generate & set signing key

```bash
gpg --full-generate-key
gpg --list-secret-keys --keyid-format=long
git config --global user.signingkey <KEY_ID_LONG>
git config --global commit.gpgsign true
```

### 8. Fix TTY (agar signing tidak error)

```bash
echo 'export GPG_TTY=$(tty)' >> ~/.bashrc
source ~/.bashrc
```

### 9. Tambahkan GPG key ke GitHub (langkah di GitHub)

Export public key:

```bash
gpg --armor --export <KEY_ID_LONG>
```

Lalu buka **GitHub → Settings → SSH and GPG keys → New GPG key** → paste.

### 10. Cek konfigurasi

```bash
git config --global --list
```
