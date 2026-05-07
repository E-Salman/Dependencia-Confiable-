const fs = require("fs");
const https = require("https");
const { exec } = require("child_process");

// URLs de imágenes
const imageUrls = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhpE6qnBx1G0X_TtMRe5b_cWHnSGr-mAJPuy1kIzcFVA&s=10",
    "https://i.pinimg.com/474x/eb/2d/de/eb2dde0578707dd3d04a26c37b75a469.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-sFg1NH-gNCMJGCqG42jygDrdBnnyvW9vh0lArr0R88_edR_d_Zk5MB4&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaQVCSzliTWkeAJJFN7sdP_SWIAjHL4APSieEd52ekpr6utM48_cHReO0&s=10
];
// Tamaño ventana
const WINDOW_WIDTH = 550;
const WINDOW_HEIGHT = 350;

// Delay entre imágenes
const DELAY_MS = 2000;

// Descargar imagen
function downloadImage(url, filename) {

    return new Promise((resolve) => {

        const file = fs.createWriteStream(filename);

        https.get(url, (response) => {

            response.pipe(file);

            file.on("finish", () => {
                file.close();
                resolve();
            });
        });
    });
}

// Obtener resolución del sistema usando PowerShell
function getScreenResolution() {

    return new Promise((resolve, reject) => {

        const command = `
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width.ToString() + ',' + [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height.ToString()"
`;

        exec(command, (error, stdout) => {

            if (error) {
                reject(error);
                return;
            }

            const [width, height] = stdout
                .trim()
                .split(",")
                .map(Number);

            resolve({ width, height });
        });
    });
}

// Posición aleatoria visible
function randomPosition(screenWidth, screenHeight) {

    const maxX = screenWidth - WINDOW_WIDTH;
    const maxY = screenHeight - WINDOW_HEIGHT;

    return {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY)
    };
}

// Mostrar imagen
function showImage(filename, x, y) {

    const psCommand = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object Windows.Forms.Form
$form.StartPosition = "Manual"
$form.Location = New-Object Drawing.Point(${x}, ${y})
$form.Size = New-Object Drawing.Size(${WINDOW_WIDTH}, ${WINDOW_HEIGHT})

$img = [System.Drawing.Image]::FromFile((Resolve-Path "${filename}"))

$pictureBox = New-Object Windows.Forms.PictureBox
$pictureBox.Image = $img
$pictureBox.Dock = "Fill"
$pictureBox.SizeMode = "StretchImage"

$form.Controls.Add($pictureBox)

$form.TopMost = $true

$form.Show()
`;

    exec(`powershell -ExecutionPolicy Bypass -Command "${psCommand}"`);
}

// Main
(async () => {

    // Detectar resolución
    const screen = await getScreenResolution();

    console.log(
        `Detected resolution: ${screen.width}x${screen.height}`
    );

    const filenames = [];

    // Descargar imágenes
    for (let i = 0; i < imageUrls.length; i++) {

        const filename = `image-${i}.jpg`;

        filenames.push(filename);

        console.log(`Downloading ${filename}`);

        await downloadImage(imageUrls[i], filename);
    }

    console.log("All images downloaded");

    let index = 0;

    // Loop infinito
    setInterval(() => {

        const filename = filenames[index % filenames.length];

        const pos = randomPosition(
            screen.width,
            screen.height
        );

        showImage(filename, pos.x, pos.y);

        index++;

    }, DELAY_MS);

})();
