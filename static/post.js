const arrowButtonContainer = document.getElementById("arrow-button");
const arrowIcon = document.getElementById("arrow-icon");
const topSection = document.getElementById("top-section");
const bottomSection = document.getElementById("bottom-section");
const relatedFeedsContainer = document.querySelector(".related-feeds");
const creatorMessageContainer = document.querySelector(".creator-message");

arrowButtonContainer.addEventListener("click", () => {
    if (topSection.classList.contains("h-5/6")) {
        bottomSection.classList.remove("overflow-y-hidden", "h-1/6");
        bottomSection.classList.add("overflow-y-auto", "h-3/4");
        topSection.classList.remove("h-5/6");
        topSection.classList.add("h-1/4");
        relatedFeedsContainer.classList.remove("hidden");
        creatorMessageContainer.classList.remove("hidden");
        arrowIcon.innerHTML = "<i class='fas fa-angle-down text-4xl'></i>";
    } else {
        topSection.classList.remove("h-1/4");
        topSection.classList.add("h-5/6");
        bottomSection.classList.remove("h-3/4", "overflow-y-auto", "mb-20");
        bottomSection.classList.add("h-1/6", "overflow-y-hidden", "mb-0");
        creatorMessageContainer.classList.add("hidden");
        relatedFeedsContainer.classList.add("hidden");
        arrowIcon.innerHTML = "<i class='fas fa-angle-up text-4xl'></i>";
    }
});