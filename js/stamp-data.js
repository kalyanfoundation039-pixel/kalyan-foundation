// Kalyan Foundation Official Stamp & Signature (Exact Uploaded Image Loader)
(function() {
    const localBrainPath = "../../brain/18737bd1-584b-4b44-a34d-2f4450caed8f/.user_uploaded/media_1790056900727.png";
    const serverPath = "assets/stamp.png";

    function loadExactStamp() {
        const stampImg = document.getElementById('rPrintStampImg');

        // If Base64 is already cached in memory
        if (window.KALYAN_STAMP_BASE64) {
            if (stampImg) stampImg.src = window.KALYAN_STAMP_BASE64;
            return;
        }

        // Load exact image and auto-convert to in-memory Base64 for 100% reliability & PDF generation
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || 400;
                canvas.height = img.naturalHeight || 400;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const b64 = canvas.toDataURL('image/png');
                window.KALYAN_STAMP_BASE64 = b64;
                if (stampImg) {
                    stampImg.src = b64;
                }
            } catch(e) {
                if (stampImg) stampImg.src = img.src;
            }
        };

        img.onerror = function() {
            // When hosted on live server (kalyanfoundation.in), load assets/stamp.png
            if (stampImg) {
                stampImg.src = serverPath;
            }
        };

        img.src = localBrainPath;
    }

    window.initOfficialStamp = loadExactStamp;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadExactStamp);
    } else {
        loadExactStamp();
    }
})();
