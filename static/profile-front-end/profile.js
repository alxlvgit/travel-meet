const footerButtons = document.querySelectorAll('.footer-btn');
const profileBtn = document.getElementById('profile-btn');

window.addEventListener('load', () => {
    footerButtons.forEach(btn => {
        btn.classList.remove('text-[#878d26]');
    });
    profileBtn.classList.add('text-[#878d26]');
}
);

