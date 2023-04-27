const feedsButton = document.getElementById("feed-link");

feedsButton.addEventListener('click', () => {
    container.innerHTML = "";
    const testText = document.createElement('p');
    testText.textContent = "This is a test";
    container.appendChild(testText);
});





