// Kalyan Foundation Official Stamp & Signature (User's Exact Uploaded Image)
(function() {
    const STAMP_SRC = "../../brain/18737bd1-584b-4b44-a34d-2f4450caed8f/.user_uploaded/media_1790054531226.png";
    window.KALYAN_STAMP_ORIGINAL_SRC = STAMP_SRC;

    function initStampImage() {
        const stampEl = document.getElementById('rPrintStampImg');
        if (stampEl) {
            stampEl.src = STAMP_SRC;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || 800;
                canvas.height = img.naturalHeight || 800;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                window.KALYAN_STAMP_BASE64 = canvas.toDataURL('image/png');
            } catch(e) {
                console.warn('Stamp caching notice:', e);
            }
        };
        img.src = STAMP_SRC;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStampImage);
    } else {
        initStampImage();
    }
})();
