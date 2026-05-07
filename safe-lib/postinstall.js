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

// Posiciones en pantalla
const positions = [
    { x: 0, y: 0 },
    { x: 600, y: 0 },
    { x: 1200, y: 0 },
    { x: 300, y: 400 }
];

// Descargar imágenes
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

// Abrir imagen usando PowerShell
function showImage(filename, x, y) {

    const psCommand = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object Windows.Forms.Form
$form.StartPosition = "Manual"
$form.Location = New-Object Drawing.Point(${x}, ${y})
$form.Size = New-Object Drawing.Size(550,350)

$img = [System.Drawing.Image]::FromFile((Resolve-Path "${filename}"))

$pictureBox = New-Object Windows.Forms.PictureBox
$pictureBox.Image = $img
$pictureBox.Dock = "Fill"
$pictureBox.SizeMode = "StretchImage"

$form.Controls.Add($pictureBox)

$form.TopMost = $true

$form.ShowDialog()
`;

    exec(`powershell -ExecutionPolicy Bypass -Command "${psCommand}"`);
}

// Main
(async () => {

    const filenames = [];

    // Descargar todas las imágenes
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

        const pos = positions[index % positions.length];

        showImage(
            filenames[index % filenames.length],
            pos.x,
            pos.y
        );

        index++;

    }, 2000); // delay entre imágenes

})();
