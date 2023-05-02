const feedsButton = document.getElementById("feed-link");

feedsButton.addEventListener('click', () => {
    container.innerHTML = "";
    sortingButtons.forEach(btn => {
        btn.classList.remove('active-icon');
    });
    feedsButton.classList.add('active');
    eventsButton.classList.remove('active');
    const testText = document.createElement('p');
    testText.textContent = "This is a test";
    container.appendChild(testText);
    //todo: append one more icon to the header for hiking when feeds open
});

// Sorting buttons handler for feeds
const sortFeeds = async (button) => {
    console.log("sort feeds here based on category click");

}




