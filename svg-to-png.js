const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sizes = [16, 48, 128];
const svgPath = path.join(__dirname, "extension", "assets", "timer-icon.svg");

// Function to convert SVG to PNG
async function convertSvgToPng() {
    try {
        // Process each size
        for (const size of sizes) {
            const outputPath = path.join(
                __dirname,
                "extension",
                "assets",
                `icon${size}.png`
            );

            await sharp(svgPath).resize(size, size).png().toFile(outputPath);

            console.log(`Created ${size}x${size} icon at: ${outputPath}`);
        }

        console.log("All icons generated successfully!");
    } catch (error) {
        console.error("Error converting SVG to PNG:", error);
    }
}

console.log("SVG to PNG conversion started. Please wait...");
convertSvgToPng();
