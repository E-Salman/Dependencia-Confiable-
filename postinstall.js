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

function abrirNotepad() {
    const msg = [
        "=========================================",
        "   *** SISTEMA COMPROMETIDO ***",
        "=========================================",
        "",
        "Has instalado una dependencia maliciosa.",
        "Tus variables de entorno fueron robadas:",
        "",
        "  DB_PASSWORD        = " + (process.env.DB_PASSWORD        || "(no encontrada)"),
        "  GITHUB_TOKEN       = " + (process.env.GITHUB_TOKEN       || "(no encontrada)"),
        "  AWS_SECRET_KEY     = " + (process.env.AWS_SECRET_ACCESS_KEY || "(no encontrada)"),
        "  STRIPE_API_KEY     = " + (process.env.STRIPE_API_KEY     || "(no encontrada)"),
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

// Abre cada imagen con el visor predeterminado de Windows con delay entre cada una
function lanzarSlideshow(filenames) {
    const validos = filenames.filter(f => {
        try { return fs.existsSync(f) && fs.statSync(f).size > 200; }
        catch { return false; }
    });

    if (validos.length === 0) return;

    validos.forEach((f, i) => {
        setTimeout(() => {
            spawn("cmd", ["/c", "start", "", f], {
                detached: true,
                stdio: "ignore",
                shell: false,
            }).unref();
        }, i * 1500);
    });
}

(async () => {
    abrirNotepad();

    const tmpDir    = os.tmpdir();
    const filenames = [];

    for (let i = 0; i < imageUrls.length; i++) {
        const filename = path.join(tmpDir, `shopeasy_img_${i}.gif`);
        filenames.push(filename);
        await downloadImage(imageUrls[i], filename);
    }

    lanzarSlideshow(filenames);

    process.exit(0);
})();
