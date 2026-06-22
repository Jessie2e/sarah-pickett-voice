document.addEventListener('DOMContentLoaded', () => {
    
    // --- Mobile Navigation Menu ---
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const siteNav = document.querySelector('.site-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = siteNav.classList.contains('is-open');
            
            // Toggle classes and accessibility attributes
            siteNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', !isOpen);
            
            // Prevent body scroll when navigation overlay is open
            document.body.style.overflow = isOpen ? '' : 'hidden';
        });

        // Close menu cleanly when an internal link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Interactive Form Handling ---
    const appointmentForm = document.getElementById('appointmentForm');
    const formStatus = document.getElementById('formStatus');

    if (appointmentForm && formStatus) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop page reload

            // Pull raw form parameters
            const formData = new FormData(appointmentForm);
            const clientName = formData.get('name');
            const selectedService = appointmentForm.querySelector('#service-interest option:checked').text;

            // Generate conversion-optimized inline confirmation state
            formStatus.className = 'form-status success';
            formStatus.innerHTML = `<strong>Thank you, ${clientName}!</strong> Your appointment request for <em>${selectedService}</em> has been received. Sarah will review your details and reach out via email shortly to confirm your clinical evaluation or coaching session.`;
            formStatus.removeAttribute('hidden');

            // Hard reset inputs safely
            appointmentForm.reset();
            
            // Smoothly display output context
            formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }
});