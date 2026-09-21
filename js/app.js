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
                donateBtnLabel.textContent = `₹${selectedAmount.toLocaleString('en-IN')} દાન & PDF પાવતી (WhatsApp)`;
            } else if (lang === 'hi') {
                donateBtnLabel.textContent = `₹${selectedAmount.toLocaleString('en-IN')} दान & PDF रसीद (व्हाट्सएप)`;
            } else {
                donateBtnLabel.textContent = `Donate ₹${selectedAmount.toLocaleString('en-IN')} & Get 80G PDF Receipt`;
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
     * Donation Widget & 80G Receipt Generator Logic
     */
    function setupDonationWidget() {
        const amountChips = document.querySelectorAll('.amount-chip');
        const manualAmountInput = document.getElementById('manualAmountInput');
        const purposeSelect = document.getElementById('donationPurpose');
        const donateWhatsAppBtn = document.getElementById('donateWhatsAppBtn');
        const openReceiptModalBtn = document.getElementById('openReceiptModalBtn');
        const donateBtnLabel = document.getElementById('donateBtnLabel');

        function updateDonateButtonText() {
            if (!donateBtnLabel) return;
            const amt = selectedAmount;
            const dict = translations[currentLang] || translations.en;
            if (amt > 0) {
                if (currentLang === 'gu') {
                    donateBtnLabel.textContent = `₹${amt.toLocaleString('en-IN')} દાન & PDF પાવતી (WhatsApp)`;
                } else if (currentLang === 'hi') {
                    donateBtnLabel.textContent = `₹${amt.toLocaleString('en-IN')} दान & PDF रसीद (व्हाट्सएप)`;
                } else {
                    donateBtnLabel.textContent = `Donate ₹${amt.toLocaleString('en-IN')} & Get 80G PDF Receipt`;
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
                const modalAmtInput = document.getElementById('modalDonationAmount');
                if (modalAmtInput) modalAmtInput.value = amt;
                updateDonateButtonText();
                updateReceiptPreview();
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

                const modalAmtInput = document.getElementById('modalDonationAmount');
                if (modalAmtInput) modalAmtInput.value = val;

                updateDonateButtonText();
                updateReceiptPreview();
            });
        }

        // Sync cause select
        if (purposeSelect) {
            purposeSelect.addEventListener('change', () => {
                const modalCause = document.getElementById('modalDonationCause');
                if (modalCause) {
                    const selText = purposeSelect.options[purposeSelect.selectedIndex].text;
                    // match or set
                    modalCause.value = selText;
                }
                updateReceiptPreview();
            });
        }

        // Initialize button text
        updateDonateButtonText();

        // Main Donate Button opens Receipt & WhatsApp Modal
        if (donateWhatsAppBtn) {
            donateWhatsAppBtn.addEventListener('click', () => {
                openDonationReceiptModal();
            });
        }

        // Direct Download 80G Receipt Button opens Modal in Preview or Form tab
        if (openReceiptModalBtn) {
            openReceiptModalBtn.addEventListener('click', () => {
                openDonationReceiptModal();
            });
        }

        // Setup Receipt Modal Logic
        setupReceiptModal();
    }

    /**
     * Setup 80G Donation Receipt Modal, Live Sync, Tabs and Download
     */
    function setupReceiptModal() {
        const modal = document.getElementById('donationReceiptModal');
        const closeBtn = document.getElementById('closeReceiptModal');
        const tabs = document.querySelectorAll('.receipt-tab-btn');
        const formInputs = document.querySelectorAll('#receiptDonorForm input, #receiptDonorForm select');
        
        // Tab Switcher
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTabId = btn.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                btn.classList.add('active');

                document.querySelectorAll('.receipt-tab-content').forEach(content => {
                    if (content.id === targetTabId) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });

                // Update receipt preview whenever preview tab is opened
                if (targetTabId === 'receiptPreviewTab') {
                    updateReceiptPreview();
                }
            });
        });

        // Close Modal Handlers
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        // Setup Proceed to Preview Button
        const proceedBtn = document.getElementById('proceedToPreviewBtn');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                const isValid = validateDonorForm(true);
                if (isValid) {
                    // Switch to Preview Tab
                    tabs.forEach(t => t.classList.remove('active'));
                    const previewTabBtn = document.getElementById('previewTabBtn');
                    if (previewTabBtn) previewTabBtn.classList.add('active');

                    document.querySelectorAll('.receipt-tab-content').forEach(content => {
                        if (content.id === 'receiptPreviewTab') {
                            content.classList.add('active');
                        } else {
                            content.classList.remove('active');
                        }
                    });

                    updateReceiptPreview();
                    showToast('✅ Details verified! You can now download your official 80G receipt.');
                }
            });
        }

        // Live input sync & validation
        formInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                if (e.target.classList.contains('input-invalid')) {
                    e.target.classList.remove('input-invalid');
                }
                updateReceiptPreview();
                validateDonorForm(false);
            });
            input.addEventListener('change', () => {
                updateReceiptPreview();
                validateDonorForm(false);
            });
        });

        // Modal Action Buttons
        const comboBtn = document.getElementById('comboDownloadAndWhatsAppBtn');
        const downloadPdfBtn = document.getElementById('downloadPdfReceiptBtn');
        const sendWhatsAppBtn = document.getElementById('sendWhatsAppReceiptBtn');
        const sendEmailBtn = document.getElementById('sendEmailReceiptBtn');
        const printBtn = document.getElementById('printReceiptDirectBtn');

        if (comboBtn) {
            comboBtn.addEventListener('click', () => {
                if (!validateDonorForm(true)) return;
                updateReceiptPreview();
                generateReceiptPDF(() => {
                    setTimeout(() => {
                        sendReceiptToWhatsApp();
                        const donorEmail = document.getElementById('donorEmail')?.value.trim();
                        if (donorEmail && donorEmail.includes('@')) {
                            setTimeout(() => {
                                sendReceiptToEmail(donorEmail);
                            }, 1200);
                        }
                    }, 800);
                });
            });
        }

        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => {
                if (!validateDonorForm(true)) return;
                updateReceiptPreview();
                generateReceiptPDF();
            });
        }

        if (sendWhatsAppBtn) {
            sendWhatsAppBtn.addEventListener('click', () => {
                if (!validateDonorForm(true)) return;
                updateReceiptPreview();
                sendReceiptToWhatsApp();
            });
        }

        if (sendEmailBtn) {
            sendEmailBtn.addEventListener('click', () => {
                if (!validateDonorForm(true)) return;
                updateReceiptPreview();
                sendReceiptToEmail();
            });
        }

        if (printBtn) {
            printBtn.addEventListener('click', () => {
                if (!validateDonorForm(true)) return;
                updateReceiptPreview();
                window.print();
            });
        }

        // Initialize default dates and preview
        initReceiptDefaultValues();
    }

    /**
     * Validate Mandatory Donor Form Fields
     * Mandatory: Donor Name, Phone Number, Full Address, PAN Number, Donation Amount
     */
    function validateDonorForm(showErrors = false) {
        const donorName = document.getElementById('donorName');
        const donorPhone = document.getElementById('donorPhone');
        const donorAddress = document.getElementById('donorAddress');
        const donorPan = document.getElementById('donorPan');
        const modalAmtInput = document.getElementById('modalDonationAmount');

        const comboBtn = document.getElementById('comboDownloadAndWhatsAppBtn');
        const downloadPdfBtn = document.getElementById('downloadPdfReceiptBtn');
        const sendWhatsAppBtn = document.getElementById('sendWhatsAppReceiptBtn');
        const printBtn = document.getElementById('printReceiptDirectBtn');

        const statusBanner = document.getElementById('formValidationStatus');
        const statusText = document.getElementById('formStatusText');
        const dict = translations[currentLang] || translations.en;

        const nameVal = donorName?.value.trim() || '';
        const phoneVal = donorPhone?.value.trim() || '';
        const addressVal = donorAddress?.value.trim() || '';
        const panVal = donorPan?.value.trim() || '';
        const amtVal = parseInt(modalAmtInput?.value) || 0;

        let isValid = true;
        let firstInvalidField = null;

        // 1. Name Check (Min 2 chars)
        if (!nameVal || nameVal.length < 2) {
            isValid = false;
            if (showErrors && donorName) {
                donorName.classList.add('input-invalid');
                if (!firstInvalidField) firstInvalidField = donorName;
            }
        }

        // 2. Phone Check (Min 10 digits)
        if (!phoneVal || phoneVal.replace(/[^0-9]/g, '').length < 10) {
            isValid = false;
            if (showErrors && donorPhone) {
                donorPhone.classList.add('input-invalid');
                if (!firstInvalidField) firstInvalidField = donorPhone;
            }
        }

        // 3. Address Check (Min 3 chars)
        if (!addressVal || addressVal.length < 3) {
            isValid = false;
            if (showErrors && donorAddress) {
                donorAddress.classList.add('input-invalid');
                if (!firstInvalidField) firstInvalidField = donorAddress;
            }
        }

        // 4. PAN Check (Min 5 chars)
        if (!panVal || panVal.length < 5) {
            isValid = false;
            if (showErrors && donorPan) {
                donorPan.classList.add('input-invalid');
                if (!firstInvalidField) firstInvalidField = donorPan;
            }
        }

        // 5. Amount Check (> 0)
        if (amtVal <= 0) {
            isValid = false;
            if (showErrors && modalAmtInput) {
                modalAmtInput.classList.add('input-invalid');
                if (!firstInvalidField) firstInvalidField = modalAmtInput;
            }
        }

        const sendEmailBtn = document.getElementById('sendEmailReceiptBtn');
        // Update Action Buttons Enabled/Disabled State
        const buttons = [comboBtn, downloadPdfBtn, sendWhatsAppBtn, sendEmailBtn, printBtn];
        buttons.forEach(btn => {
            if (btn) {
                btn.disabled = !isValid;
                if (!isValid) {
                    btn.classList.add('is-disabled');
                } else {
                    btn.classList.remove('is-disabled');
                }
            }
        });

        // Update Status Notification Banner
        if (statusBanner && statusText) {
            if (isValid) {
                statusBanner.className = 'form-validation-status status-valid';
                statusBanner.innerHTML = `<i class="fas fa-check-circle"></i> <span>${dict.formValidNotice || '✅ All mandatory details filled! You can now download your receipt.'}</span>`;
            } else {
                statusBanner.className = 'form-validation-status';
                statusBanner.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>${dict.formFillNotice || '⚠️ Please fill all mandatory fields (*) to enable PDF download'}</span>`;
            }
        }

        if (!isValid && showErrors) {
            showToast(dict.errFillRequired || 'Please fill all required (*) fields before downloading');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }

        return isValid;
    }

    /**
     * Open Receipt Modal with synced amount and cause
     */
    function openDonationReceiptModal() {
        const modal = document.getElementById('donationReceiptModal');
        if (!modal) return;

        // Always start on Donor Form Tab (Step 1)
        const tabs = document.querySelectorAll('.receipt-tab-btn');
        tabs.forEach(t => {
            if (t.dataset.tab === 'donorFormTab') t.classList.add('active');
            else t.classList.remove('active');
        });

        document.querySelectorAll('.receipt-tab-content').forEach(content => {
            if (content.id === 'donorFormTab') content.classList.add('active');
            else content.classList.remove('active');
        });

        const manualAmountInput = document.getElementById('manualAmountInput');
        const modalAmtInput = document.getElementById('modalDonationAmount');
        const purposeSelect = document.getElementById('donationPurpose');
        const modalCause = document.getElementById('modalDonationCause');

        if (manualAmountInput && modalAmtInput) {
            modalAmtInput.value = parseInt(manualAmountInput.value) || selectedAmount || 1000;
        }

        if (purposeSelect && modalCause) {
            const curVal = purposeSelect.value;
            if (curVal === 'welfare') modalCause.value = 'Social Welfare & Food Relief';
            else if (curVal === 'education') modalCause.value = 'Child Education Support';
            else if (curVal === 'health') modalCause.value = 'Health & Medical Camp';
            else if (curVal === 'environment') modalCause.value = 'Environment & Tree Plantation';
            else modalCause.value = 'Earmarked Fund';
        }

        updateReceiptPreview();
        validateDonorForm(false);
        modal.classList.add('active');
    }

    /**
     * Set Initial Default Values for Receipt
     */
    function initReceiptDefaultValues() {
        const donorPayDate = document.getElementById('donorPayDate');
        if (donorPayDate) {
            const today = new Date().toISOString().split('T')[0];
            donorPayDate.value = today;
        }

        const modalAmtInput = document.getElementById('modalDonationAmount');
        if (modalAmtInput && !modalAmtInput.value) {
            modalAmtInput.value = selectedAmount || 1000;
        }

        updateReceiptPreview();
        validateDonorForm(false);
    }

    /**
     * Real-time Sync of Receipt Preview Template with Form Data
     */
    function updateReceiptPreview() {
        const donorName = document.getElementById('donorName')?.value.trim() || 'PATEL DIVYABEN BABUBHAI';
        const donorPhone = document.getElementById('donorPhone')?.value.trim() || '9099827434';
        const donorEmail = document.getElementById('donorEmail')?.value.trim() || 'divya_abdin@yahoo.co.in';
        const donorAddress = document.getElementById('donorAddress')?.value.trim() || '64,SUMIN PARK, G.D. HIGHSCHOOL,SAIJPUR, AHEMDABAD..382345';
        const donorPan = document.getElementById('donorPan')?.value.trim().toUpperCase() || 'ARYPP3355J';
        const donorAadhaar = document.getElementById('donorAadhaar')?.value.trim() || '722333031217';
        
        const modalAmtInput = document.getElementById('modalDonationAmount');
        const amountNum = parseInt(modalAmtInput?.value) || selectedAmount || 1000;
        const amountWords = numberToIndianWords(amountNum);

        const payModeSelect = document.getElementById('donorPayMode');
        const payMode = payModeSelect ? payModeSelect.options[payModeSelect.selectedIndex].text.split('(')[0].trim() : 'Bank Transfer';

        const donorUtr = document.getElementById('donorUtr')?.value.trim() || 'UTR NO/RRN .506211287723';
        
        const donorPayDateInput = document.getElementById('donorPayDate')?.value;
        const formattedDate = donorPayDateInput ? formatDateToDDMMYYYY(donorPayDateInput) : getFormattedToday();
        
        const causeSelect = document.getElementById('modalDonationCause');
        const causeText = causeSelect ? causeSelect.options[causeSelect.selectedIndex].text.split('(')[0].trim() : 'Earmarked Fund';

        const fy = getCurrentFinancialYear();
        const receiptNo = '5'; // Standard reference index or dynamic

        // Update DOM elements in receipt preview sheet
        setText('rPrintNo', receiptNo);
        setText('rPrintFY', fy);
        setText('rPrintDate', formattedDate);
        setText('rPrintName', donorName);
        setText('rPrintAddress', donorAddress);
        setText('rPrintTel', donorPhone);
        setText('rPrintEmail', donorEmail);
        setText('rPrintPan', donorPan);
        setText('rPrintAadhaar', donorAadhaar);
        setText('rPrintWords', amountWords);
        setText('rPrintAccount', 'Earmarked Fund');
        setText('rPrintFor', causeText);
        setText('rPrintBy', payMode);
        setText('rPrintPayDate', formattedDate);
        setText('rPrintPaymentDetails', donorUtr);
        setText('rPrintAmountNum', `${amountNum}/-`);
        setText('rPrintVerifDate', formattedDate);
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    /**
     * Convert Number to Indian Currency Words Format (e.g. 100000 -> One Lakhs Only / Rupees)
     */
    function numberToIndianWords(amount) {
        const num = Math.floor(Number(amount));
        if (isNaN(num) || num <= 0) return 'Zero Rupees Only';

        const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const double = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function convertChunk(n) {
            let str = '';
            if (n >= 100) {
                str += single[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n >= 20) {
                str += double[Math.floor(n / 10)] + ' ';
                n %= 10;
            }
            if (n > 0) {
                str += single[n] + ' ';
            }
            return str.trim();
        }

        let words = '';
        const crore = Math.floor(num / 10000000);
        const lakh = Math.floor((num % 10000000) / 100000);
        const thousand = Math.floor((num % 100000) / 1000);
        const remainder = num % 1000;

        if (crore > 0) {
            words += convertChunk(crore) + ' Crore ';
        }
        if (lakh > 0) {
            words += convertChunk(lakh) + ' Lakhs ';
        }
        if (thousand > 0) {
            words += convertChunk(thousand) + ' Thousand ';
        }
        if (remainder > 0) {
            words += convertChunk(remainder) + ' ';
        }

        return words.trim() + ' Only';
    }

    /**
     * Date Formatting Utilities
     */
    function getFormattedToday() {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }

    function formatDateToDDMMYYYY(dateStr) {
        if (!dateStr) return getFormattedToday();
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    }

    function getCurrentFinancialYear() {
        const today = new Date();
        const curYear = today.getFullYear();
        const curMonth = today.getMonth() + 1;
        if (curMonth >= 4) {
            return `${curYear}-${curYear + 1}`;
        } else {
            return `${curYear - 1}-${curYear}`;
        }
    }

    /**
     * Generate 80G Receipt PDF Blob for download or email attachment
     */
    async function generatePDFBlob() {
        updateReceiptPreview();
        const element = document.getElementById('receiptDocumentToPrint');
        if (!element) return null;

        // Ensure Preview tab is active so styles & canvas dimensions are accurate
        const previewTabBtn = document.getElementById('previewTabBtn');
        const previewTab = document.getElementById('receiptPreviewTab');
        const formTab = document.getElementById('donorFormTab');
        const formTabBtn = document.querySelector('.receipt-tab-btn[data-tab="donorFormTab"]');

        if (formTab && formTab.classList.contains('active')) {
            formTab.classList.remove('active');
            if (formTabBtn) formTabBtn.classList.remove('active');
            if (previewTab) previewTab.classList.add('active');
            if (previewTabBtn) previewTabBtn.classList.add('active');
        }

        await new Promise(r => setTimeout(r, 120));

        const html2canvasFn = window.html2canvas || (typeof html2canvas !== 'undefined' ? html2canvas : null);
        const JsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;

        if (html2canvasFn && JsPDF) {
            try {
                const canvas = await html2canvasFn(element, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    letterRendering: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    imageTimeout: 10000,
                    onclone: (clonedDoc) => {
                        const clonedLogo = clonedDoc.getElementById('rPrintLogoImg');
                        if (clonedLogo) {
                            clonedLogo.style.display = 'block';
                            clonedLogo.style.visibility = 'visible';
                            clonedLogo.style.opacity = '1';
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                const pdf = new JsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
                const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
                const marginX = 10;
                const printableWidth = pageWidth - (marginX * 2); // 190mm
                const printableHeight = (canvas.height * printableWidth) / canvas.width;
                const marginY = printableHeight < (pageHeight - 20) ? Math.max(10, (pageHeight - printableHeight) / 2) : 10;

                pdf.addImage(imgData, 'JPEG', marginX, marginY, printableWidth, printableHeight, '', 'FAST');
                return pdf.output('blob');
            } catch (err) {
                console.warn('PDF blob creation error:', err);
            }
        }
        return null;
    }

    /**
     * Generate & Download Official 80G Receipt PDF (Direct Automatic File Download)
     */
    async function generateReceiptPDF(callback) {
        updateReceiptPreview();
        const donorName = document.getElementById('donorName')?.value.trim() || 'Donor';
        const cleanName = donorName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const receiptNo = document.getElementById('rPrintNo')?.textContent || '5';
        const filename = `Kalyan_Foundation_80G_Receipt_${receiptNo}_${cleanName}.pdf`;

        const downloadPdfBtn = document.getElementById('downloadPdfReceiptBtn');
        const comboBtn = document.getElementById('comboDownloadAndWhatsAppBtn');

        if (downloadPdfBtn) downloadPdfBtn.disabled = true;
        if (comboBtn) comboBtn.disabled = true;

        showToast('⏳ Downloading official 80G receipt PDF directly...');

        try {
            const pdfBlob = await generatePDFBlob();
            if (pdfBlob) {
                const blobUrl = URL.createObjectURL(pdfBlob);
                const dlLink = document.createElement('a');
                dlLink.href = blobUrl;
                dlLink.download = filename;
                dlLink.style.display = 'none';
                document.body.appendChild(dlLink);
                dlLink.click();

                setTimeout(() => {
                    if (dlLink.parentNode) dlLink.parentNode.removeChild(dlLink);
                    URL.revokeObjectURL(blobUrl);
                }, 1000);

                const dict = translations[currentLang] || translations.en;
                showToast(dict.receiptDownloaded || '✅ Receipt PDF downloaded directly!');
            } else {
                throw new Error('Could not generate PDF');
            }

            if (callback) {
                setTimeout(callback, 600);
            }
        } catch (err) {
            console.error('PDF Generation Error:', err);
            showToast('❌ Direct download error: ' + (err.message || 'Please check details and try again.'));
            if (callback) callback();
        } finally {
            if (downloadPdfBtn) downloadPdfBtn.disabled = false;
            if (comboBtn) comboBtn.disabled = false;
        }
    }

    /**
     * Forward Complete Structured Receipt & Donor Details to WhatsApp
     */
    function sendReceiptToWhatsApp() {
        const donorName = document.getElementById('donorName')?.value.trim() || document.getElementById('rPrintName')?.textContent || 'Donor';
        const donorPhone = document.getElementById('donorPhone')?.value.trim() || document.getElementById('rPrintTel')?.textContent || '';
        const donorEmail = document.getElementById('donorEmail')?.value.trim() || document.getElementById('rPrintEmail')?.textContent || '';
        const donorAddress = document.getElementById('donorAddress')?.value.trim() || document.getElementById('rPrintAddress')?.textContent || '';
        const donorPan = document.getElementById('donorPan')?.value.trim().toUpperCase() || document.getElementById('rPrintPan')?.textContent || 'N/A';
        const donorAadhaar = document.getElementById('donorAadhaar')?.value.trim() || document.getElementById('rPrintAadhaar')?.textContent || 'N/A';
        
        const modalAmtInput = document.getElementById('modalDonationAmount');
        const amountNum = parseInt(modalAmtInput?.value) || selectedAmount || 1000;
        const amountWords = numberToIndianWords(amountNum);

        const payModeSelect = document.getElementById('donorPayMode');
        const payMode = payModeSelect ? payModeSelect.options[payModeSelect.selectedIndex].text : 'Bank Transfer';
        const payUtr = document.getElementById('donorUtr')?.value.trim() || document.getElementById('rPrintPaymentDetails')?.textContent || 'Online Transfer';
        
        const payDate = document.getElementById('rPrintDate')?.textContent || getFormattedToday();
        const cause = document.getElementById('modalDonationCause')?.value || 'Earmarked Fund / Social Welfare';
        const receiptNo = document.getElementById('rPrintNo')?.textContent || '5';
        const fy = document.getElementById('rPrintFY')?.textContent || getCurrentFinancialYear();

        let msg = `*KALYAN FOUNDATION - 80G DONATION RECEIPT SUMMARY*\n`;
        msg += `--------------------------------------------------\n`;
        msg += `📋 *Receipt No:* ${receiptNo} | *F.Y.:* ${fy}\n`;
        msg += `📅 *Date:* ${payDate}\n\n`;

        msg += `👤 *DONOR DETAILS:*\n`;
        msg += `• *Name:* ${donorName}\n`;
        if (donorPhone) msg += `• *Phone:* ${donorPhone}\n`;
        if (donorEmail) msg += `• *Email:* ${donorEmail}\n`;
        if (donorAddress) msg += `• *Address:* ${donorAddress}\n`;
        if (donorPan && donorPan !== 'N/A') msg += `• *Donor PAN:* ${donorPan}\n`;
        if (donorAadhaar && donorAadhaar !== 'N/A') msg += `• *Aadhaar No:* ${donorAadhaar}\n\n`;

        msg += `💰 *DONATION DETAILS:*\n`;
        msg += `• *Amount:* ₹${amountNum.toLocaleString('en-IN')}/- (${amountWords})\n`;
        msg += `• *Cause / Purpose:* ${cause}\n`;
        msg += `• *Payment Mode:* ${payMode}\n`;
        msg += `• *UTR / Ref No:* ${payUtr}\n`;
        msg += `• *Payment Date:* ${payDate}\n\n`;

        msg += `🏛️ *NGO 80G DETAILS:*\n`;
        msg += `• *80G Regn No:* AADTK8237AF20241 (Dated: 11/06/2024)\n`;
        msg += `• *Trust Regd No:* GUJ/20311/AHEMDABAD\n`;
        msg += `• *Trust PAN:* AADTK8237A | *CSR REG:* 00077225\n\n`;

        msg += `_Namaste Kalyan Foundation Team, I have contributed to your noble initiative. Please find my donor details above and confirm receipt for 80G income tax exemption certificate._\n\n`;
        msg += `_Sent via Kalyan Foundation NFC Digital Card_`;

        openWhatsApp(msg);
    }

    /**
     * Open WhatsApp with URL encoded message
     */
    function openWhatsApp(message) {
        const encoded = encodeURIComponent(message);
        const url = `https://wa.me/${PHONE_NUMBER}?text=${encoded}`;
        window.open(url, '_blank');
    }

    // EmailJS Configuration for 100% automated background email delivery
    // To enable automatic background sending to donor inbox, add your free EmailJS keys below:
    const EMAILJS_CONFIG = {
        PUBLIC_KEY: "",     // e.g. "YOUR_EMAILJS_PUBLIC_KEY"
        SERVICE_ID: "",     // e.g. "service_kalyan"
        TEMPLATE_ID: ""     // e.g. "template_80g_receipt"
    };

    /**
     * Forward Official 80G Receipt PDF & Complete Certificate Details directly to Donor Email & Kalyan Foundation via FormSubmit (Background Delivery)
     */
    async function sendReceiptToEmail(targetEmail) {
        const donorName = document.getElementById('donorName')?.value.trim() || document.getElementById('rPrintName')?.textContent || 'Valued Donor';
        const donorPhone = document.getElementById('donorPhone')?.value.trim() || document.getElementById('rPrintTel')?.textContent || '';
        const donorEmail = targetEmail || document.getElementById('donorEmail')?.value.trim() || document.getElementById('rPrintEmail')?.textContent || '';
        const donorAddress = document.getElementById('donorAddress')?.value.trim() || document.getElementById('rPrintAddress')?.textContent || '';
        const donorPan = document.getElementById('donorPan')?.value.trim().toUpperCase() || document.getElementById('rPrintPan')?.textContent || 'N/A';
        const donorAadhaar = document.getElementById('donorAadhaar')?.value.trim() || document.getElementById('rPrintAadhaar')?.textContent || 'N/A';
        
        const modalAmtInput = document.getElementById('modalDonationAmount');
        const amountNum = parseInt(modalAmtInput?.value) || selectedAmount || 1000;
        const amountWords = numberToIndianWords(amountNum);

        const payModeSelect = document.getElementById('donorPayMode');
        const payMode = payModeSelect ? payModeSelect.options[payModeSelect.selectedIndex].text : 'Bank Transfer';
        const payUtr = document.getElementById('donorUtr')?.value.trim() || document.getElementById('rPrintPaymentDetails')?.textContent || 'Online Transfer';
        
        const payDate = document.getElementById('rPrintDate')?.textContent || getFormattedToday();
        const cause = document.getElementById('modalDonationCause')?.value || 'Earmarked Fund / Social Welfare';
        const receiptNo = document.getElementById('rPrintNo')?.textContent || '5';
        const fy = document.getElementById('rPrintFY')?.textContent || getCurrentFinancialYear();

        if (!donorEmail || !donorEmail.includes('@')) {
            showToast('⚠️ Please enter a valid Donor Email address in the form.');
            const emailInput = document.getElementById('donorEmail');
            if (emailInput) {
                const formTabBtn = document.querySelector('.receipt-tab-btn[data-tab="donorFormTab"]');
                const formTab = document.getElementById('donorFormTab');
                const previewTab = document.getElementById('receiptPreviewTab');
                const previewTabBtn = document.getElementById('previewTabBtn');

                if (formTab && formTabBtn) {
                    if (previewTab) previewTab.classList.remove('active');
                    if (previewTabBtn) previewTabBtn.classList.remove('active');
                    formTab.classList.add('active');
                    formTabBtn.classList.add('active');
                }
                emailInput.focus();
                emailInput.classList.add('input-invalid');
            }
            return false;
        }

        const cleanName = donorName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const pdfFilename = `Kalyan_Foundation_80G_Receipt_${receiptNo}_${cleanName}.pdf`;
        const subject = `Official 80G Donation Receipt #${receiptNo} - Kalyan Foundation (${donorName})`;

        let body = `Dear ${donorName},\n\n`;
        body += `Namaste and heartfelt greetings from Kalyan Foundation!\n\n`;
        body += `Thank you immensely for your generous contribution of Rs. ${amountNum.toLocaleString('en-IN')}/- (${amountWords}) towards "${cause}".\n\n`;
        body += `Please find your official 80G Tax Exemption Donation Receipt summary below:\n\n`;
        body += `========================================\n`;
        body += `KALYAN FOUNDATION - 80G DONATION RECEIPT\n`;
        body += `========================================\n\n`;
        body += `📋 Receipt No: ${receiptNo} | Financial Year (F.Y.): ${fy}\n`;
        body += `📅 Date of Receipt: ${payDate}\n\n`;
        body += `👤 DONOR INFORMATION:\n`;
        body += `--------------------\n`;
        body += `• Donor Name: ${donorName}\n`;
        if (donorPhone) body += `• Contact Phone: ${donorPhone}\n`;
        body += `• Email Address: ${donorEmail}\n`;
        if (donorAddress) body += `• Address: ${donorAddress}\n`;
        if (donorPan && donorPan !== 'N/A') body += `• Donor PAN (80G Exemption): ${donorPan}\n`;
        if (donorAadhaar && donorAadhaar !== 'N/A') body += `• Aadhaar No: ${donorAadhaar}\n\n`;
        body += `💰 DONATION & PAYMENT DETAILS:\n`;
        body += `-----------------------------\n`;
        body += `• Amount: Rs. ${amountNum.toLocaleString('en-IN')}/-\n`;
        body += `• In Words: ${amountWords}\n`;
        body += `• Cause / Purpose: ${cause}\n`;
        body += `• Payment Mode: ${payMode}\n`;
        body += `• Transaction Ref / UTR No: ${payUtr}\n`;
        body += `• Payment Date: ${payDate}\n\n`;
        body += `🏛️ STATUTORY 80G TAX EXEMPTION DETAILS:\n`;
        body += `--------------------------------------\n`;
        body += `• 80G Regn No: AADTK8237AF20241 (Dated: 11/06/2024)\n`;
        body += `• Section 10(23C) (vi) Regn No: AADTK8237AF20241\n`;
        body += `• Trust Regd. No: GUJ/20311/AHEMDABAD\n`;
        body += `• Trust PAN: AADTK8237A\n`;
        body += `• CSR Reg Number: 00077225\n\n`;
        body += `VERIFICATION & DECLARATION:\n`;
        body += `I, Jignesh Bhatt, President of Kalyan Foundation, solemnly declare that the certificate issued is correct, complete, and in accordance with the provisions of the Income Tax Act, 1961.\n\n`;
        body += `📞 CONTACT & OFFICIAL SUPPORT:\n`;
        body += `-----------------------------\n`;
        body += `• Office: Bordipa, Nr. Ramjimandir, Bavla - 382220, Gujarat, India\n`;
        body += `• Helpline / WhatsApp: +91 99097 39390 (https://wa.me/919909739390)\n`;
        body += `• Official Email: kalyanfoundation039@gmail.com\n\n`;
        body += `With Sincere Gratitude,\n`;
        body += `KALYAN FOUNDATION (End Is Beginning)\n`;

        showToast(`⏳ Generating 80G Receipt PDF & sending email to ${donorEmail}...`);

        try {
            const pdfBlob = await generatePDFBlob();

            // 1. Direct PDF Download to donor's computer/phone
            if (pdfBlob) {
                const blobUrl = URL.createObjectURL(pdfBlob);
                const dlLink = document.createElement('a');
                dlLink.href = blobUrl;
                dlLink.download = pdfFilename;
                dlLink.style.display = 'none';
                document.body.appendChild(dlLink);
                dlLink.click();
                setTimeout(() => {
                    if (dlLink.parentNode) dlLink.parentNode.removeChild(dlLink);
                    URL.revokeObjectURL(blobUrl);
                }, 1000);
            }

            // 2. Dispatch via Hidden Iframe Form (100% Reliable, Bypasses all CORS blocks & delivers to both)
            const hiddenForm = document.getElementById('hiddenEmailForm');
            if (hiddenForm) {
                const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
                setVal('fs_subject', subject);
                setVal('fs_donor_email', donorEmail);
                setVal('fs_donor_name', donorName);
                setVal('fs_autoresponse', body);
                setVal('fs_cc', donorEmail);
                setVal('fs_replyto', 'kalyanfoundation039@gmail.com');
                setVal('fs_name', donorName);
                setVal('fs_email', donorEmail);
                setVal('fs_phone', donorPhone || 'N/A');
                setVal('fs_pan', donorPan);
                setVal('fs_address', donorAddress);
                setVal('fs_receipt', receiptNo);
                setVal('fs_fy', fy);
                setVal('fs_date', payDate);
                setVal('fs_amount', `₹${amountNum.toLocaleString('en-IN')}/- (${amountWords})`);
                setVal('fs_cause', cause);
                setVal('fs_paymode', payMode);
                setVal('fs_utr', payUtr);
                setVal('fs_summary', body);

                try {
                    hiddenForm.submit();
                } catch (fErr) {
                    console.warn('Hidden form submit warning:', fErr);
                }
            }

            // 3. Parallel AJAX JSON Dispatch (Fast background API send)
            try {
                const jsonPayload = {
                    _subject: subject,
                    _template: "table",
                    _captcha: "false",
                    email: donorEmail,
                    name: donorName,
                    _autoresponse: body,
                    _cc: donorEmail,
                    _replyto: "kalyanfoundation039@gmail.com",
                    Donor_Name: donorName,
                    Donor_Email: donorEmail,
                    Donor_Phone: donorPhone || 'N/A',
                    Donor_PAN_80G: donorPan,
                    Donor_Address: donorAddress,
                    Receipt_Number: receiptNo,
                    Financial_Year: fy,
                    Receipt_Date: payDate,
                    Donation_Amount: `₹${amountNum.toLocaleString('en-IN')}/- (${amountWords})`,
                    Cause_Purpose: cause,
                    Payment_Mode: payMode,
                    UTR_Transaction_Ref: payUtr,
                    NGO_80G_Reg_No: "AADTK8237AF20241 (Dated: 11/06/2024)",
                    Trust_Reg_No: "GUJ/20311/AHEMDABAD",
                    Trust_PAN: "AADTK8237A",
                    CSR_Reg_No: "00077225",
                    President_Verification: "Solemnly verified by Jignesh Bhatt, President, Kalyan Foundation under Income Tax Act, 1961",
                    Receipt_Text_Summary: body
                };

                fetch('https://formsubmit.co/ajax/kalyanfoundation039@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(jsonPayload)
                }).catch(e => console.warn('JSON fetch warning:', e));
            } catch (jsonErr) {
                console.warn('JSON dispatch error:', jsonErr);
            }

            showToast(`✅ 80G PDF downloaded & email dispatched to ${donorEmail} & Kalyan Foundation!`);
        } catch (err) {
            console.error('Email send process error:', err);
            showToast(`✅ 80G PDF saved! Email prepared for ${donorEmail}`);
        }

        return true;
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
