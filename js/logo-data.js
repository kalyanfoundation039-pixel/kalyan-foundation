// Kalyan Foundation Official Logo Data URL Auto-Cache
(function() {
    function initLogoBase64() {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || 400;
                canvas.height = img.naturalHeight || 400;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                window.KALYAN_LOGO_BASE64 = canvas.toDataURL('image/jpeg', 0.95);
                const printLogo = document.getElementById('rPrintLogoImg');
                if (printLogo) {
                    printLogo.src = window.KALYAN_LOGO_BASE64;
                }
            } catch(e) {
                console.warn('Logo cache notice:', e);
            }
        };
        img.src = "assets/logo.jpg";
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogoBase64);
    } else {
        initLogoBase64();
    }
})();
