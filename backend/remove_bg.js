const Jimp = require('jimp');

async function processLogos() {
    // Logo 1: Remove White Background
    const img1 = await Jimp.read('../Logo - 1.jpeg');
    img1.scan(0, 0, img1.bitmap.width, img1.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        // Very bright = white
        if (r > 230 && g > 230 && b > 230) {
            this.bitmap.data[idx + 3] = 0; // Alpha 0
        }
    });
    await img1.writeAsync('../Logo - 1 - transparent.png');
    
    // Logo 2: Remove Black Background
    const img2 = await Jimp.read('../Logo - 2.jpeg');
    img2.scan(0, 0, img2.bitmap.width, img2.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        // Very dark = black
        if (r < 25 && g < 25 && b < 25) {
            this.bitmap.data[idx + 3] = 0; // Alpha 0
        }
    });
    await img2.writeAsync('../Logo - 2 - transparent.png');
    
    console.log("Transparency applied successfully!");
}

processLogos().catch(console.error);
