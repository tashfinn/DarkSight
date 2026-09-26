// offscreen.js

let ortSession = null;
let tesseractWorker = null;

// Initialize ML Models
async function initModels() {
    try {
        console.log("Initializing ONNX Runtime Web...");
        // Configure ORT to look for WASM in the lib folder using absolute extension URL
        ort.env.wasm.wasmPaths = chrome.runtime.getURL('lib/');
        ort.env.wasm.numThreads = 1; // Disable Web Workers for ORT to prevent import() issues
        
        try {
            ortSession = await ort.InferenceSession.create(chrome.runtime.getURL('lib/yolov5s.onnx'));
            console.log("YOLOv5 ONNX model loaded successfully.");
        } catch (e) {
            console.warn("Failed to load yolov5s.onnx. Ensure the model file is placed in the lib folder.", e);
        }

        console.log("Initializing Tesseract.js...");
        tesseractWorker = await Tesseract.createWorker('eng', 1, {
            workerPath: chrome.runtime.getURL('lib/worker.min.js'),
            corePath: chrome.runtime.getURL('lib/tesseract-core.wasm.js'),
            langPath: chrome.runtime.getURL('lib'), // Load eng.traineddata from lib/
            workerBlobURL: false, // Prevent CSP errors with blob workers in MV3
            logger: m => console.log(m)
        });
        console.log("Tesseract.js loaded successfully.");

    } catch (e) {
        console.error("Error initializing models in offscreen document:", e);
    }
}

let initPromise = initModels();

// Preprocess image for YOLOv5 (resize to 640x640, normalize, transpose)
function preprocess(canvas) {
    // Basic placeholder for YOLOv5 preprocessing. 
    // This expects a 640x640 input tensor.
    // In a full implementation, you extract image data, normalize to 0-1, and create an ort.Tensor
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 640, 640).data;
    const float32Data = new Float32Array(3 * 640 * 640);
    
    // Convert to NCHW [1, 3, 640, 640]
    for (let i = 0; i < 640 * 640; i++) {
        float32Data[i] = imgData[i * 4] / 255.0; // R
        float32Data[i + 640 * 640] = imgData[i * 4 + 1] / 255.0; // G
        float32Data[i + 2 * 640 * 640] = imgData[i * 4 + 2] / 255.0; // B
    }
    
    return new ort.Tensor('float32', float32Data, [1, 3, 640, 640]);
}

// Run inference on a given base64 image data URL
async function runVisualDetection(dataUrl, bannerRects, dpr) {
    await initPromise; // Ensure models are fully loaded before processing

    if (!tesseractWorker) {
        console.warn("Tesseract worker failed to initialize. Cannot run OCR.");
        return { boxes: [], text: "", ocrLines: [], error: "Tesseract worker failed to initialize. Check offscreen document console." };
    }

    // Load image to canvas
    const img = new Image();
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load image from screenshot data"));
        img.src = dataUrl;
    });

    let allOcrLines = [];
    let detectedText = "";
    
    // If no rects provided, fallback to scanning the entire image
    if (!bannerRects || bannerRects.length === 0) {
        bannerRects = [{ x: 0, y: 0, width: img.width / dpr, height: img.height / dpr }];
    }

    for (const rect of bannerRects) {
        // Map CSS viewport coordinates to actual image pixel coordinates using the device pixel ratio
        const sx = rect.x * dpr;
        const sy = rect.y * dpr;
        const sw = rect.width * dpr;
        const sh = rect.height * dpr;

        // Create a cropped canvas for just this banner
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = sw;
        cropCanvas.height = sh;
        const cropCtx = cropCanvas.getContext('2d');
        
        // Apply CSS filters to drastically improve OCR accuracy on colored backgrounds
        cropCtx.filter = 'grayscale(100%) contrast(200%)';
        cropCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        // Reset filter
        cropCtx.filter = 'none';

        try {
            const { data } = await tesseractWorker.recognize(cropCanvas);
            
            if (data.text && data.text.trim().length >= 4) {
                detectedText += data.text + " ";
                allOcrLines.push({
                    id: rect.id,
                    text: data.text.trim()
                });
            }
        } catch (e) {
            console.error("OCR error on banner crop:", e);
        }
    }

    return { boxes: [], text: detectedText.trim(), ocrLines: allOcrLines };
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "processImage") {
        runVisualDetection(message.dataUrl, message.bannerRects, message.dpr).then(result => {
            sendResponse({ success: true, result });
        }).catch(err => {
            sendResponse({ success: false, error: err.toString() });
        });
        return true; // Keep channel open
    }
});
