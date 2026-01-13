# Menghubungkan Local Machine ke Development Instance

|         |                           |
| :------ | :------------------------ |
| Version | 1.0                       |
| Date    | 12 January 2026           |
| Owner   | Cloud Infrastructure Team |

## A. Admin Side: Provisioning Instance

### 1. Akses Repository

Buka repository infrastruktur:

```
https://github.com/piksel-ina/piksel-infra/tree/main/dev
```

### 2. Konfigurasi Variables

Buat file `dev.auto.tfvars` di direktori tersebut:

```hcl
# Contoh konfigurasi
aws_region  = "ap-southeast-3"
name_prefix = "piksel"

tags = {
  Project     = "Indonesia-Datacube"
  Environment = "dev"
}

allowed_account_ids = ["236122835646"]

# Auto-stop: 19:00 WIB (UTC+7) = 12:00 UTC
autostop_schedule_expression = "cron(0 12 * * ? *)"
autostop_group_name          = "dev-night-stop"

keypair_name_prefix = "dev-instance-"
ssh_private_key_dir = ".secrets"

instances = {
  taufik = {
    instance_type   = "t3.large"
    root_volume_gb  = 75
    enable_autostop = true
    tags            = { Owner = "Taufik" }
  }
}
```

**Penjelasan singkat:**

- `instances`: Map berisi konfigurasi per developer (key = nama user)
- `ssh_private_key_dir`: Lokasi penyimpanan private key yang akan di-generate
- `autostop_schedule_expression`: Cron expression untuk auto-stop (default: 19:00 WIB)

### 3. Deploy Infrastructure

> #### Penting!
>
> Pastikan aws profile sudah sesuai (akun $Piksel Develpment)

```bash
terraform apply
```

### 4. Lokasi Private Key

Setelah `terraform apply` selesai, private key akan tersimpan di:

```
.secrets/dev-instance-{nama}.pem
```

Contoh untuk user `taufik`:

```
.secrets/dev-instance-taufik.pem
```

### 5. Dapatkan Public IP Instance

```bash
terraform output

# Atau cek di AWS Console > EC2 > Instances
```

## B. SSH ke Development Instance

### 1. Terima Private Key dari Admin

Admin akan memberikan file `.pem`. Simpan di lokasi yang aman, misalnya:

```
~/.ssh/dev-instance-taufik.pem
```

### 2. Set Permission Private Key

```bash
chmod 600 ~/.ssh/dev-instance-taufik.pem
```

### 3. SSH ke Instance

```bash
ssh -i ~/.ssh/dev-instance-taufik.pem ubuntu@<PUBLIC_IP>
```

**Contoh:**

```bash
ssh -i ~/.ssh/dev-instance-taufik.pem ubuntu@13.229.45.123
```

### 4. (Recommended) Buat SSH Config untuk Kemudahan

Edit file `~/.ssh/config`:

```
Host piksel-dev
    HostName <PUBLIC_IP>
    User ubuntu
    IdentityFile ~/.ssh/dev-instance-taufik.pem
    ServerAliveInterval 300
    ServerAliveCountMax 144
```

Setelah konfigurasi, cukup jalankan:

```bash
ssh piksel-dev
```

> ### ⚠️ Penting: Auto-Stop Schedule
>
> - Instance akan **otomatis mati** setiap hari jam **19:00 WIB** (12:00 UTC)
> - Untuk menyalakan kembali: Start manual via AWS Console, AWS CLI atau gunakan [script](./helper/ec2_scripts.sh)
>
> **Catatan:** Auto-stop hanya mematikan instance, tidak menghapus data. Semua file dan konfigurasi tetap tersimpan di EBS volume.

## C. Setup VSCode Remote Connection

### 1. Install Extension

Install extension **Remote Development** di VSCode:

- Buka VSCode
- Go to Extensions (`Ctrl+Shift+X`)
- Search: `Remote Development`
- Install extension pack dari Microsoft (termasuk Remote-SSH)

### 2. Copy Private Key ke Lokasi Aman

Pastikan file `.pem` sudah disimpan di lokasi yang aman dengan permission yang benar:

```bash
# Linux/Mac
chmod 600 ~/.ssh/dev-instance-taufik.pem

# Windows (PowerShell - run as Administrator)
icacls "$env:USERPROFILE\.ssh\dev-instance-taufik.pem" /inheritance:r
icacls "$env:USERPROFILE\.ssh\dev-instance-taufik.pem" /grant:r "$($env:USERNAME):R"
```

### 3. Buat SSH Config File

Lokasi file config:

- **Linux/Mac**: `~/.ssh/config`
- **Windows**: `C:\Users\<Username>\.ssh\config`

Isi file config:

```
Host piksel-dev
    HostName <PUBLIC_IP>
    User ubuntu
    IdentityFile ~/.ssh/dev-instance-taufik.pem # Jika, linux
    IdentityFile C:\Users\YourName\.ssh\dev-instance-taufik.pem # Jika, windows
    ServerAliveInterval 300
    ServerAliveCountMax 144
```

### 4. Connect via VSCode

1. Buka Command Palette: `Ctrl+Shift+P` (Windows/Linux)
2. Ketik: `Remote-SSH: Connect to Host...`
3. Pilih host: `piksel-dev`
4. VSCode akan membuka window baru dan connect ke remote server
5. Tunggu hingga VSCode selesai install VSCode Server di remote machine

### 5. Verifikasi Connection

Setelah terkoneksi:

- Status bar kiri bawah akan menampilkan: `SSH: piksel-dev`

## D. Helper Script: EC2 Instance Control

Bash script untuk mempercepat rutinitas start/stop instance tanpa perlu membuka AWS Console.

### Setup

1. **Download script**: Copy file [ec2_scripts.sh](./helper/ec2_scripts.sh)

2. **Edit Instance ID**: Ganti `INSTANCE_ID` dengan ID instance dari admin

   ```bash
   INSTANCE_ID="i-009f4a69c33b2b934"  # Ganti dengan instance ID
   ```

   > Instance ID tidak akan berubah kecuali instance di-terminate

3. **Set executable permission**:
   ```bash
   chmod +x ec2_scripts.sh
   ```

### Usage

```bash
# Start instance
bash ec2_scripts.sh start

# Stop instance
bash ec2_scripts.sh stop

# Check status
bash ec2_scripts.sh status

# List all instances
bash ec2_scripts.sh list
```

### ⚠️ Penting

- **Selalu matikan instance** setelah selesai menggunakan untuk menghemat cost
- Instance **tidak menggunakan Elastic IP**, sehingga Public IP akan **berubah** setiap kali start
- Gunakan command `status` untuk mendapatkan Public IP terbaru setelah start instance
- Update `HostName` di `~/.ssh/config` dengan Public IP baru, atau gunakan IP langsung saat SSH

## E. Tools yang Sudah Terinstall

Instance sudah dilengkapi dengan development tools berikut:

| Tool           | Versi  | Deskripsi                            |
| -------------- | ------ | ------------------------------------ |
| **Docker**     | Latest | Container runtime + Compose plugin   |
| **AWS CLI**    | v2     | AWS command line interface           |
| **GitHub CLI** | Latest | `gh` command untuk GitHub operations |
| **Python 3**   | 3.10+  | Dengan pip, venv, dan build tools    |
| **uv**         | Latest | Fast Python package installer        |
| **Git**        | Latest | Version control                      |
| **Starship**   | Latest | Modern shell prompt                  |
| **Utilities**  | -      | curl, jq, htop, tmux, ripgrep, fzf   |

### Verifikasi Tools

```bash
docker --version
aws --version
gh --version
uv --version
python3 --version
```

## F. Best Practices

- **Jangan commit** file `.pem` ke version control (Git)
- **Jangan share** private key melalui channel yang tidak aman
- Simpan private key dengan permission `600`
- Commit dan push code secara berkala
- Stop instance jika tidak digunakan untuk menghemat cost
- Monitor disk usage: `df -h`
- Monitor resource: `htop`
