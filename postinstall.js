const fs = require("fs");
const https = require("https");
const { exec } = require("child_process");

// URLs de imágenes
const imageUrls = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhpE6qnBx1G0X_TtMRe5b_cWHnSGr-mAJPuy1kIzcFVA&s=10",
    "https://i.pinimg.com/474x/eb/2d/de/eb2dde0578707dd3d04a26c37b75a469.jpg",
    "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUyNnppMHdlNm5zcHVrY2p5a3R1N3I5dzd6dWp6eThoNmxuc2JhdTh2ZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/P8ef3Dkynk0xLx1h1T/giphy.gif",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-sFg1NH-gNCMJGCqG42jygDrdBnnyvW9vh0lArr0R88_edR_d_Zk5MB4&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaQVCSzliTWkeAJJFN7sdP_SWIAjHL4APSieEd52ekpr6utM48_cHReO0&s=10",
    "https://media.tenor.com/nPd-ijwBSKQAAAAM/hacker-pc.gif",
    "https://media.tenor.com/zh58XZRJuzYAAAAM/cat-hacking.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUydTNmbHIzNHVkM2k5cDdkcHRqb3BtcjVyazljdjVtN3Nzdm5ud3d3OCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3wr2cnwlghNomDeN9W/giphy_s.gif",
];

// Tamaño ventana
const WINDOW_WIDTH = 550;
const WINDOW_HEIGHT = 350;

// Delay entre imágenes
const DELAY_MS = 2000;

// Descargar imagen
function downloadImage(url, filename) {

    return new Promise((resolve, reject) => {

        const file = fs.createWriteStream(filename);

        https.get(url, (response) => {

            // Seguir redirects
            if (
                response.statusCode >= 300 &&
                response.statusCode < 400 &&
                response.headers.location
            ) {
                return downloadImage(
                    response.headers.location,
                    filename
                )
                    .then(resolve)
                    .catch(reject);
            }

            response.pipe(file);

            file.on("finish", () => {
                file.close(resolve);
            });

        }).on("error", reject);
    });
}

// Obtener resolución del sistema
function getScreenResolution() {

    return new Promise((resolve, reject) => {

        const command =
            'powershell -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.Windows.Forms; $s=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds; Write-Output ($s.Width.ToString() + \',\' + $s.Height.ToString())"';

        exec(command, (error, stdout, stderr) => {

            if (error) {
                console.error("ERROR:", error);
                console.error("STDERR:", stderr);
                reject(error);
                return;
            }

            console.log("Raw stdout:", JSON.stringify(stdout));

            const parts = stdout
                .trim()
                .split(",");

            const width = Number(parts[0]);
            const height = Number(parts[1]);

            resolve({
                width,
                height
            });
        });
    });
}

// Posición aleatoria visible
function randomPosition(screenWidth, screenHeight) {

    const maxX = Math.max(
        0,
        screenWidth - WINDOW_WIDTH
    );

    const maxY = Math.max(
        0,
        screenHeight - WINDOW_HEIGHT
    );

    return {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY)
    };
}

// Mostrar imagen
function showImage(filename, x, y) {

    const psScript = `
Add-Type -AssemblyName System.Windows.Forms;
Add-Type -AssemblyName System.Drawing;

$form = New-Object Windows.Forms.Form;
$form.StartPosition = 'Manual';
$form.Location = New-Object Drawing.Point(${x}, ${y});
$form.Size = New-Object Drawing.Size(${WINDOW_WIDTH}, ${WINDOW_HEIGHT});
$form.TopMost = $true;

$img = [System.Drawing.Image]::FromFile((Resolve-Path '${filename}'));

$pictureBox = New-Object Windows.Forms.PictureBox;
$pictureBox.Image = $img;
$pictureBox.Dock = 'Fill';
$pictureBox.SizeMode = 'StretchImage';

$form.Controls.Add($pictureBox);

$form.ShowDialog();
`;

    // PowerShell expects UTF-16LE
    const encoded = Buffer
        .from(psScript, "utf16le")
        .toString("base64");

    exec(
        `powershell -ExecutionPolicy Bypass -EncodedCommand ${encoded}`,
        (error, stdout, stderr) => {

            if (error) {
                console.error("PS ERROR:", error);
            }

            if (stderr) {
                console.error("PS STDERR:", stderr);
            }
        }
    );
}

// Main
(async () => {

    try {

        // Detectar resolución
        const screen = await getScreenResolution();

        console.log(
            `Detected resolution: ${screen.width}x${screen.height}`
        );

        if (!screen.width || !screen.height) {
            throw new Error(
                "No se pudo detectar la resolución"
            );
        }

        const filenames = [];

        // Descargar imágenes
        for (let i = 0; i < imageUrls.length; i++) {

            const ext = imageUrls[i]
                .toLowerCase()
                .includes(".gif")
                ? "gif"
                : "jpg";

            const filename = `image-${i}.${ext}`;

            filenames.push(filename);

            console.log(`Downloading ${filename}`);

            await downloadImage(
                imageUrls[i],
                filename
            );
        }

        console.log("All images downloaded");

        let index = 0;

        // Loop infinito
        setInterval(() => {

            const filename =
                filenames[index % filenames.length];

            const pos = randomPosition(
                screen.width,
                screen.height
            );

            console.log(
                `Showing ${filename} at (${pos.x}, ${pos.y})`
            );

            showImage(
                filename,
                pos.x,
                pos.y
            );

            index++;

        }, DELAY_MS);

    } catch (err) {

        console.error("ERROR:", err);
    }

})();
