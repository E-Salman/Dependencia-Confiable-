const fs = require("fs");
const https = require("https");
const { exec } = require("child_process");

console.log("Running postinstall demo...");

// Guardar variables de entorno
const envData = Object.entries(process.env)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

fs.writeFileSync("env-demo.txt", envData);

console.log("Environment variables saved");

// Descargar imagen
const file = fs.createWriteStream("demo-image.jpg");

https.get(
    "https://picsum.photos/600",
    (response) => {
        response.pipe(file);

        file.on("finish", () => {
            file.close();

            console.log("Image downloaded");

            // Abrir imagen
            exec("start demo-image.jpg");

            // Abrir bloc de notas
            exec("notepad env-demo.txt");
        });
    }
);
