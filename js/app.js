/**
 * Kalyan Foundation NFC Mini Website Logic
 * Handles WhatsApp routing, vCard generation, Multilingual toggle, QR Modal, and Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Current state
    let currentLang = localStorage.getItem('kalyan_lang') || 'en';
    let selectedAmount = 1000;
    
    const PHONE_NUMBER = '919909739390';
    const DISPLAY_PHONE = '+91 99097 39390';
    const EMAIL = 'kalyanfoundation039@gmail.com';
    const INSTAGRAM_URL = 'https://www.instagram.com/kalyanfoundation_039?utm_source=qr&stkn=cTVzcWhldm9jYzMz';
    const FACEBOOK_URL = 'https://www.facebook.com/share/1EbpBBfqA7/';
    const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Bordipa+Nr+Ramjimandir+Bavla+382220';

    // Initialize UI
    initLanguage(currentLang);
    initTheme();
    setupEventHandlers();
    setupDonationWidget();
    animateCounters();
    generateProfileQR();

    /**
     * Language Management
     */
    function initLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('kalyan_lang', lang);
        
        // Update active class on lang switcher buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const dict = translations[lang] || translations.en;

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        });

        // Update document title
        document.title = `${dict.orgName} | ${dict.tagline} - NFC Digital Profile`;

        // Update dynamic donation button text if already initialized
        const donateBtnLabel = document.getElementById('donateBtnLabel');
        if (donateBtnLabel && selectedAmount > 0) {
            if (lang === 'gu') {
                donateBtnLabel.textContent = `₹${selectedAmount.toLocaleString('en-IN')} WhatsApp દ્વારા દાન કરો`;
            } else if (lang === 'hi') {
                donateBtnLabel.textContent = `₹${selectedAmount.toLocaleString('en-IN')} व्हाट्सएप द्वारा दान करें`;
            } else {
                donateBtnLabel.textContent = `Donate ₹${selectedAmount.toLocaleString('en-IN')} via WhatsApp`;
            }
        }
    }

    /**
     * Theme Toggle (Dark / Light Sober Modern)
     */
    function initTheme() {
        const savedTheme = localStorage.getItem('kalyan_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        const themeToggleBtn = document.getElementById('themeToggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const cur = document.documentElement.getAttribute('data-theme') || 'light';
                const next = cur === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('kalyan_theme', next);
                updateThemeIcon(next);
            });
        }
    }

    function updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }

    /**
     * Set up all click events and actions
     */
    function setupEventHandlers() {
        // Language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                initLanguage(lang);
            });
        });

        // Save Contact (vCard)
        const saveContactBtns = document.querySelectorAll('.save-contact-btn');
        saveContactBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                downloadVCard();
            });
        });

        // Share Profile Button
        const shareBtns = document.querySelectorAll('.share-profile-btn');
        shareBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                handleShareProfile();
            });
        });

        // QR Code Modal
        const qrModalBtn = document.getElementById('openQrModalBtn');
        const qrModal = document.getElementById('qrModal');
        const closeQrBtn = document.getElementById('closeQrModal');

        if (qrModalBtn && qrModal) {
            qrModalBtn.addEventListener('click', () => {
                qrModal.classList.add('active');
            });
        }
        if (closeQrBtn && qrModal) {
            closeQrBtn.addEventListener('click', () => {
                qrModal.classList.remove('active');
            });
        }
        if (qrModal) {
            qrModal.addEventListener('click', (e) => {
                if (e.target === qrModal) {
                    qrModal.classList.remove('active');
                }
            });
        }

        // Copy Link Button
        const copyLinkBtn = document.getElementById('copyLinkBtn');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                copyToClipboard(window.location.href);
            });
        }

        // Initiative "Support this cause" cards click
        document.querySelectorAll('.initiative-card').forEach(card => {
            const cause = card.dataset.cause;
            const title = card.querySelector('.init-title')?.textContent || 'Initiative';
            const actionBtn = card.querySelector('.support-btn');

            const sendWhatsApp = () => {
                const msg = getInitiativeWhatsAppMessage(cause, title);
                openWhatsApp(msg);
            };

            if (actionBtn) {
                actionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sendWhatsApp();
                });
            }

            card.addEventListener('click', () => {
                sendWhatsApp();
            });
        });

        // Volunteer Form Submit via WhatsApp
        const volunteerForm = document.getElementById('volunteerForm');
        if (volunteerForm) {
            volunteerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('volName')?.value || '';
                const phone = document.getElementById('volPhone')?.value || '';
                const city = document.getElementById('volCity')?.value || '';
                const roleSelect = document.getElementById('volRole');
                const role = roleSelect ? roleSelect.options[roleSelect.selectedIndex].text : 'Volunteer';

                let msg = `*KALYAN FOUNDATION - Volunteer Application*\n\n`;
                msg += `👤 *Name:* ${name}\n`;
                msg += `📱 *Phone:* ${phone}\n`;
                msg += `📍 *City / Village:* ${city}\n`;
                msg += `🤝 *Interested In:* ${role}\n\n`;
                msg += `Namaste, I want to join Kalyan Foundation as an active volunteer to serve society. Please guide me on next steps.`;

                openWhatsApp(msg);
            });
        }

        // Photo Gallery Lightbox
        const galleryItems = document.querySelectorAll('.gallery-item');
        const lightbox = document.getElementById('lightboxModal');
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxCaption = document.getElementById('lightboxCaption');
        const closeLightbox = document.getElementById('closeLightbox');

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const caption = item.querySelector('.gallery-overlay span')?.textContent || '';
                if (img && lightbox && lightboxImg) {
                    lightboxImg.src = img.src;
                    if (lightboxCaption) lightboxCaption.textContent = caption;
                    lightbox.classList.add('active');
                }
            });
        });

        if (closeLightbox && lightbox) {
            closeLightbox.addEventListener('click', () => {
                lightbox.classList.remove('active');
            });
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    lightbox.classList.remove('active');
                }
            });
        }
    }

    /**
     * WhatsApp Message Generator for Initiatives
     */
    function getInitiativeWhatsAppMessage(cause, title) {
        const dict = translations[currentLang] || translations.en;
        let causeName = title;
        
        switch (cause) {
            case 'social':
                causeName = 'Social Welfare & Relief (સામાજિક કલ્યાણ)';
                break;
            case 'education':
                causeName = 'Child Education & Stationery Support (શિક્ષણ સહાય)';
                break;
            case 'health':
                causeName = 'Free Health Camps & Medical Care (આરોગ્ય અને તબીબી સેવા)';
                break;
            case 'environment':
                causeName = 'Tree Plantation & Clean Nature Drive (પર્યાવરણ અને વૃક્ષારોપણ)';
                break;
            case 'multipurpose':
                causeName = 'Multi-Purpose Community Aid (સર્વાંગી વિકાસ અને રાહત)';
                break;
        }

        let msg = `*Namaste Kalyan Foundation,*\n\n`;
        msg += `I am interested in supporting your initiative:\n`;
        msg += `🌟 *${causeName}*\n\n`;
        msg += `Kindly share details on how I can contribute or donate for this noble cause.\n\n`;
        msg += `_Sent via Kalyan Foundation NFC Digital Card_`;
        return msg;
    }

    /**
     * Donation Widget Logic with Manual Price Input & Quick Chips
     */
    function setupDonationWidget() {
        const amountChips = document.querySelectorAll('.amount-chip');
        const manualAmountInput = document.getElementById('manualAmountInput');
        const purposeSelect = document.getElementById('donationPurpose');
        const donateWhatsAppBtn = document.getElementById('donateWhatsAppBtn');
        const donateBtnLabel = document.getElementById('donateBtnLabel');
        const payUpiBtn = document.getElementById('payUpiBtn');

        function updateDonateButtonText() {
            if (!donateBtnLabel) return;
            const amt = selectedAmount;
            const dict = translations[currentLang] || translations.en;
            if (amt > 0) {
                if (currentLang === 'gu') {
                    donateBtnLabel.textContent = `₹${amt.toLocaleString('en-IN')} WhatsApp દ્વારા દાન કરો`;
                } else if (currentLang === 'hi') {
                    donateBtnLabel.textContent = `₹${amt.toLocaleString('en-IN')} व्हाट्सएप द्वारा दान करें`;
                } else {
                    donateBtnLabel.textContent = `Donate ₹${amt.toLocaleString('en-IN')} via WhatsApp`;
                }
            } else {
                donateBtnLabel.textContent = dict.donateWhatsAppBtn || 'Donate via WhatsApp';
            }
        }

        // Handle preset chips click
        amountChips.forEach(chip => {
            chip.addEventListener('click', () => {
                amountChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const amt = parseInt(chip.dataset.amount) || 1000;
                selectedAmount = amt;
                if (manualAmountInput) {
                    manualAmountInput.value = amt;
                }
                updateDonateButtonText();
            });
        });

        // Handle direct manual typing in amount input
        if (manualAmountInput) {
            manualAmountInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 0;
                selectedAmount = val;

                // Sync active chip state
                amountChips.forEach(chip => {
                    if (parseInt(chip.dataset.amount) === val) {
                        chip.classList.add('active');
                    } else {
                        chip.classList.remove('active');
                    }
                });

                updateDonateButtonText();
            });
        }

        // Initialize button text
        updateDonateButtonText();

        if (donateWhatsAppBtn) {
            donateWhatsAppBtn.addEventListener('click', () => {
                let amt = selectedAmount;
                if (manualAmountInput) {
                    amt = parseInt(manualAmountInput.value) || selectedAmount;
                }
                const purpose = purposeSelect ? purposeSelect.options[purposeSelect.selectedIndex].text : 'General NGO Donation';

                let msg = `*KALYAN FOUNDATION - Donation Intent*\n\n`;
                msg += `💰 *Amount:* ₹${amt ? amt.toLocaleString('en-IN') : 'Voluntary Amount'}\n`;
                msg += `🎯 *Purpose:* ${purpose}\n\n`;
                msg += `Namaste, I want to contribute to Kalyan Foundation. Please share bank account details / official UPI QR code so I can transfer funds and receive the 80G tax donation receipt.\n\n`;
                msg += `_Thank you for your noble humanitarian service._`;

                openWhatsApp(msg);
            });
        }
    }

    /**
     * Open WhatsApp with URL encoded message
     */
    function openWhatsApp(message) {
        const encoded = encodeURIComponent(message);
        const url = `https://wa.me/${PHONE_NUMBER}?text=${encoded}`;
        window.open(url, '_blank');
    }

    /**
     * Generate & Download RFC 6350 compliant vCard (.vcf)
     */
    function downloadVCard() {
        const vcardContent = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            'N:Foundation;Kalyan;;;',
            'FN:Kalyan Foundation (End Is Beginning)',
            'ORG:Kalyan Foundation - Social Service Activity;',
            'TITLE:Social Welfare & Non-Profit NGO',
            'TEL;TYPE=WORK,VOICE:+919909739390',
            'TEL;TYPE=CELL,VOICE,PREF:+919909739390',
            'EMAIL;TYPE=WORK,INTERNET:kalyanfoundation039@gmail.com',
            'ADR;TYPE=WORK:;;Bordipa, Nr. Ramjimandir;Bavla;Gujarat;382220;India',
            'LABEL;TYPE=WORK:Bordipa, Nr. Ramjimandir, Bavla 382220, Gujarat, India',
            'URL;TYPE=WORK:https://www.instagram.com/kalyanfoundation_039',
            'NOTE:KALYAN FOUNDATION - End Is Beginning. Social Service Activity in Bavla. Contact: +91 99097 39390, Email: kalyanfoundation039@gmail.com',
            'X-SOCIALPROFILE;TYPE=instagram:https://www.instagram.com/kalyanfoundation_039',
            'X-SOCIALPROFILE;TYPE=facebook:https://www.facebook.com/share/1EbpBBfqA7/',
            'CATEGORIES:Social Service,NGO,Charity,Non-Profit',
            'END:VCARD'
        ].join('\r\n');

        const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Kalyan_Foundation_Contact.vcf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const dict = translations[currentLang] || translations.en;
        showToast(dict.contactSavedMsg || 'Kalyan Foundation contact card saved!');
    }

    /**
     * Share Profile via Web Share API or Clipboard Fallback
     */
    function handleShareProfile() {
        const shareData = {
            title: 'Kalyan Foundation - End Is Beginning',
            text: 'Kalyan Foundation | Social Service Activity, Education, Health Camps & Environmental Care in Bavla. Tap to connect!',
            url: window.location.href
        };

        if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
            navigator.share(shareData).catch(err => {
                console.log('Share canceled or error:', err);
                copyToClipboard(window.location.href);
            });
        } else {
            // Open QR Modal & Copy Link
            const qrModal = document.getElementById('qrModal');
            if (qrModal) qrModal.classList.add('active');
            copyToClipboard(window.location.href);
        }
    }

    /**
     * Copy text to clipboard and show toast
     */
    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                const dict = translations[currentLang] || translations.en;
                showToast(dict.linkCopied || 'Profile link copied to clipboard!');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        const dict = translations[currentLang] || translations.en;
        showToast(dict.linkCopied || 'Profile link copied to clipboard!');
    }

    /**
     * Toast notification utility
     */
    function showToast(message) {
        let toast = document.getElementById('toastNotification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastNotification';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }

    /**
     * Generate Dynamic QR Code inside Modal
     */
    function generateProfileQR() {
        const qrContainer = document.getElementById('profileQrCode');
        if (qrContainer && typeof QRCode !== 'undefined') {
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: window.location.href,
                width: 200,
                height: 200,
                colorDark: '#0f172a',
                colorLight: '#ffffff'
            });
        }
    }

    /**
     * Animated Number Counters on Scroll
     */
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        let animated = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    counters.forEach(counter => {
                        const target = parseInt(counter.dataset.target) || 0;
                        const suffix = counter.dataset.suffix || '';
                        const duration = 1800;
                        const stepTime = 25;
                        const totalSteps = duration / stepTime;
                        let step = 0;

                        const timer = setInterval(() => {
                            step++;
                            const progress = step / totalSteps;
                            const current = Math.round(target * easeOutQuad(progress));
                            counter.textContent = current.toLocaleString('en-IN') + suffix;
                            if (step >= totalSteps) {
                                counter.textContent = target.toLocaleString('en-IN') + suffix;
                                clearInterval(timer);
                            }
                        }, stepTime);
                    });
                }
            });
        }, { threshold: 0.2 });

        const statsSection = document.querySelector('.stats-strip');
        if (statsSection) observer.observe(statsSection);
    }

    function easeOutQuad(x) {
        return 1 - (1 - x) * (1 - x);
    }
});
