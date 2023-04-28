const feedsButton = document.getElementById("feed-link");

feedsButton.addEventListener('click', () => {
    container.innerHTML = "";
    sortEventsButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    feedsButton.classList.add('active');
    eventsButton.classList.remove('active');
    const testText = document.createElement('p');
    testText.textContent = "This is a test";
    container.appendChild(testText);
});





