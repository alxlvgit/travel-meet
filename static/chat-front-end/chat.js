const footerButtons = document.querySelectorAll('.footer-btn');
const chatBtn = document.getElementById('chat-btn');

window.addEventListener('load', () => {
    footerButtons.forEach(btn => {
        btn.classList.remove('text-[#878d26]');
    });
    chatBtn.classList.add('text-[#878d26]');
}
);