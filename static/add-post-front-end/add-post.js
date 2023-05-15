const footerButtons = document.querySelectorAll('.footer-btn');
const addPostBtn = document.getElementById('add-post-btn');


window.addEventListener('load', () => {
    footerButtons.forEach(btn => {
        btn.classList.remove('text-[#878d26]');
    });
    addPostBtn.classList.add('text-[#878d26]');
}
);