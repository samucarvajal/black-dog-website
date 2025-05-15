// Input fields and SVG text elements
const dateInput = document.getElementById("date-input");
const line1Input = document.getElementById("line1-input");
const line2Input = document.getElementById("line2-input");
const line3Input = document.getElementById("line3-input");

// Current format state - starting with square
let currentFormat = 'square';

// Background image element
const bgImage = document.getElementById("bgImage");
const poster = document.querySelector('.poster');

// Function to get SVG text elements
function getSvgElements() {
    return {
        dateText: document.getElementById("date"),
        line1Text: document.getElementById("line1"),
        line2Text: document.getElementById("line2"),
        line3Text: document.getElementById("line3")
    };
}

// Function to get background color name
function getBackgroundColor(filename) {
    switch(filename) {
        case 'image-bg.png':
            return 'blue';
        case 'image-bg-2.png':
            return 'red';
        case 'image-bg-3.png':
            return 'green';
        case 'image-bg-4.png':
            return 'purple';
        default:
            return 'blue';
    }
}

// Function to update format
function updateFormat(format) {
    currentFormat = format;
    
    // Update poster class
    poster.className = 'poster';
    poster.classList.add(`format-${format}`);

    // Update image paths
    const selectedBg = document.querySelector('input[name="background"]:checked').value;
    updateImages(selectedBg);

    // Update SVG template
    document.getElementById('svg-container').innerHTML = posterTemplates[format];

    // Reattach text content
    const { dateText, line1Text, line2Text, line3Text } = getSvgElements();
    dateText.textContent = dateInput.value ? dateInput.value.toUpperCase() : "DAY 00 MON";
    line1Text.textContent = line1Input.value || "Venue Name / Address and Number, City";
    line2Text.textContent = line2Input.value || "Ticket Price / Show Time";
    line3Text.textContent = line3Input.value;
}

// Function to update all images for a format
function updateImages(bgFilename) {
    const formatPath = `assets/${currentFormat}/`;
    bgImage.src = formatPath + bgFilename;
    
    // Get all layers and update their paths
    const overlayLayers = document.querySelectorAll('.layer');
    overlayLayers[0].src = formatPath + 'image-bd.png';  // First overlay
    overlayLayers[1].src = formatPath + 'image.svg';     // Second overlay
}

// Format button click handlers
document.querySelectorAll('.format-button').forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        document.querySelector('.format-button.active').classList.remove('active');
        button.classList.add('active');

        // Update format
        updateFormat(button.dataset.format);
    });
});

// Update SVG text dynamically
dateInput.addEventListener("input", () => {
    const { dateText } = getSvgElements();
    dateText.textContent = dateInput.value ? dateInput.value.toUpperCase() : "DAY 00 MON";
});

line1Input.addEventListener("input", () => {
    const { line1Text } = getSvgElements();
    line1Text.textContent = line1Input.value || "Venue Name / Address and Number, City";
});

line2Input.addEventListener("input", () => {
    const { line2Text } = getSvgElements();
    line2Text.textContent = line2Input.value || "Ticket Price / Show Time";
});

line3Input.addEventListener("input", () => {
    const { line3Text } = getSvgElements();
    line3Text.textContent = line3Input.value;
});

// Add background color change functionality
document.querySelectorAll('input[name="background"]').forEach(input => {
    input.addEventListener('change', (e) => {
        updateImages(e.target.value);
    });
});

// Load fonts for canvas
async function loadCanvasFonts() {
    const fontFamilies = [
        new FontFace('Helvetica Neue LT Pro Bold Extended', `url(data:application/x-font-woff2;base64,${fonts.helveticaNeueBoldExtended})`),
        new FontFace('Helvetica Neue LT Pro Condensed', `url(data:application/x-font-woff2;base64,${fonts.helveticaNeueCondensed})`)
    ];

    try {
        const loadedFonts = await Promise.all(fontFamilies.map(async font => {
            const loadedFont = await font.load();
            document.fonts.add(loadedFont);
            return loadedFont;
        }));

        // Wait for fonts to be ready
        await document.fonts.ready;
        
        return true;
    } catch (error) {
        console.error('Font loading failed:', error);
        return false;
    }
}

// Download the poster as a PNG
document.getElementById("download-btn").addEventListener("click", async () => {
    try {
        const { dateText, line1Text, line2Text } = getSvgElements();
        
        // Ensure fonts are loaded
        await loadCanvasFonts();
        
        const canvas = document.createElement("canvas");

        // Set canvas dimensions based on format
        switch(currentFormat) {
            case 'story':
                canvas.width = 1080;
                canvas.height = 1920;
                break;
            case 'square':
                canvas.width = 1080;
                canvas.height = 1080;
                break;
            default: // post
                canvas.width = 1080;
                canvas.height = 1350;
        }

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Get the selected background image
        const selectedBg = document.querySelector('input[name="background"]:checked').value;

        // Draw the background image
        const background = new Image();
        background.src = `assets/${currentFormat}/${selectedBg}`;
        
        await new Promise((resolve, reject) => {
            background.onload = resolve;
            background.onerror = reject;
        });
        
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Draw the overlay layers
        const layer1 = new Image();
        layer1.src = `assets/${currentFormat}/image-bd.png`;
        
        await new Promise((resolve, reject) => {
            layer1.onload = resolve;
            layer1.onerror = reject;
        });
        
        ctx.drawImage(layer1, 0, 0, canvas.width, canvas.height);

        const layer2 = new Image();
        layer2.src = `assets/${currentFormat}/image.svg`;
        
        await new Promise((resolve, reject) => {
            layer2.onload = resolve;
            layer2.onerror = reject;
        });
        
        ctx.drawImage(layer2, 0, 0, canvas.width, canvas.height);

        // Draw the SVG text
        const svgElement = document.querySelector("#Text");
        
        // Clear placeholder text before export if inputs are empty
        if (!dateInput.value) dateText.textContent = "";
        if (!line1Input.value) line1Text.textContent = "";
        if (!line2Input.value) line2Text.textContent = "";
        
        const svgData = new XMLSerializer().serializeToString(svgElement);
        
        // Add font declarations to SVG
        const svgWithFonts = svgData.replace(
            '<style id="fontStyles">',
            `<style id="fontStyles">
                @font-face {
                    font-family: 'Helvetica Neue LT Pro Bold Extended';
                    src: url('data:application/x-font-woff2;base64,${fonts.helveticaNeueBoldExtended}') format('woff2');
                }
                @font-face {
                    font-family: 'Helvetica Neue LT Pro Condensed';
                    src: url('data:application/x-font-woff2;base64,${fonts.helveticaNeueCondensed}') format('woff2');
                }
            `
        );

        const svgImage = new Image();
        await new Promise((resolve, reject) => {
            svgImage.onload = resolve;
            svgImage.onerror = reject;
            const encodedSvg = encodeURIComponent(svgWithFonts)
                .replace(/'/g, '%27')
                .replace(/"/g, '%22');
            svgImage.src = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
        });
        
        ctx.drawImage(svgImage, 0, 0, canvas.width, canvas.height);

        // Restore placeholder text after drawing
        if (!dateInput.value) dateText.textContent = "DAY 00 MON";
        if (!line1Input.value) line1Text.textContent = "Venue Name / Address and Number, City";
        if (!line2Input.value) line2Text.textContent = "Ticket Price / Show Time";

        // Export to PNG with custom filename
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngFile;
        
        // Get the date from input or use a default
        const dateValue = dateInput.value.replace(/\s+/g, '-') || 'DATE';
        
        // Get the background color name
        const bgColor = getBackgroundColor(selectedBg);
        
        // Create the filename
        downloadLink.download = `BDTLZE_${currentFormat}_${dateValue}_${bgColor}.png`;
        downloadLink.click();

    } catch (error) {
        console.error("Error in download process:", error);
        alert('There was an error generating your poster. Please try again.');
    }
});
