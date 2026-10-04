document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const siteNav = document.querySelector('.site-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', () => {
            const willOpen = !siteNav.classList.contains('is-open');
            siteNav.classList.toggle('is-open', willOpen);
            navToggle.setAttribute('aria-expanded', String(willOpen));
            document.body.classList.toggle('nav-open', willOpen);
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('nav-open');
            });
        });
    }

    // Reusable tablet/mobile horizontal carousels.
    document.querySelectorAll('[data-carousel]').forEach((carousel) => {
        const track = carousel.querySelector('.carousel-track');
        const cards = Array.from(track?.children || []);
        const prev = carousel.querySelector('.carousel-prev');
        const next = carousel.querySelector('.carousel-next');
        const count = carousel.querySelector('.carousel-count');

        if (!track || !cards.length || !prev || !next || !count) return;

        const closestIndex = () => {
            const left = track.scrollLeft;
            let bestIndex = 0;
            let bestDistance = Infinity;
            cards.forEach((card, index) => {
                const distance = Math.abs(card.offsetLeft - track.offsetLeft - left);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestIndex = index;
                }
            });
            return bestIndex;
        };

        const update = () => {
            const index = closestIndex();
            count.textContent = `${index + 1} / ${cards.length}`;
            prev.disabled = index === 0;
            next.disabled = index === cards.length - 1;
        };

        const goTo = (index) => {
            const safeIndex = Math.max(0, Math.min(cards.length - 1, index));
            cards[safeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        };

        prev.addEventListener('click', () => goTo(closestIndex() - 1));
        next.addEventListener('click', () => goTo(closestIndex() + 1));
        track.addEventListener('scroll', () => window.requestAnimationFrame(update), { passive: true });
        window.addEventListener('resize', update);
        update();
    });

    // Keep insurance detail compact on small screens, expanded on larger screens.
    const insuranceDetails = document.querySelector('.insurance-notice');
    const insuranceMedia = window.matchMedia('(max-width: 640px)');
    const setInsuranceState = (event) => {
        if (!insuranceDetails) return;
        if (event.matches) insuranceDetails.removeAttribute('open');
        else insuranceDetails.setAttribute('open', '');
    };
    setInsuranceState(insuranceMedia);
    insuranceMedia.addEventListener?.('change', setInsuranceState);

    // Formspree form handling
    const appointmentForm = document.getElementById('appointmentForm');
    const formStatus = document.getElementById('formStatus');
    const preferredContact = document.getElementById('preferred-contact');
    const phone = document.getElementById('phone');

    const syncPhoneRequirement = () => {
        if (!preferredContact || !phone) return;
        const needsPhone = preferredContact.value === 'phone' || preferredContact.value === 'text';
        phone.required = needsPhone;
        phone.setAttribute('aria-required', String(needsPhone));
    };

    preferredContact?.addEventListener('change', syncPhoneRequirement);
    syncPhoneRequirement();

    if (appointmentForm && formStatus) {
        appointmentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            syncPhoneRequirement();

            if (!appointmentForm.reportValidity()) return;

            const endpoint = appointmentForm.getAttribute('action') || '';
            const submitButton = appointmentForm.querySelector('button[type="submit"]');

            formStatus.hidden = true;
            formStatus.className = 'form-status';

            if (!endpoint || endpoint.includes('YOUR_FORM_ID')) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'This form is ready, but the Formspree endpoint still needs to be connected before the site goes live.';
                formStatus.hidden = false;
                return;
            }

            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending…';

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: new FormData(appointmentForm),
                    headers: { Accept: 'application/json' }
                });

                if (!response.ok) throw new Error('Form submission failed');

                appointmentForm.reset();
                syncPhoneRequirement();
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Thank you — your request has been sent. Sarah will follow up using your preferred contact method.';
                formStatus.hidden = false;
            } catch (error) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Something went wrong while sending the form. Please try again in a moment.';
                formStatus.hidden = false;
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
});
