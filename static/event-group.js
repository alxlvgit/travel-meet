let groupsRendered = false;
const currentUrl = window.location.href;
const eventId = currentUrl.split('/')[4];

// Init Swiper for event page
const swiper = new Swiper(".swiper", {
    slidesPerView: "auto",
    freeMode: true,
    mousewheel: {
        releaseOnEdges: true,
    },
});

// Check if URL contains group
if (currentUrl.includes('event') && currentUrl.includes('group')) {
    groupsRendered = true;
    console.log('URL contains both "event" and "group"');
} else {
    console.log('URL does not contain both "event" and "group"');
}

// Change Back button link for group page
if (groupsRendered) {
    const backButton = document.querySelector('.back-link');
    backButton.attributes.href.value = `/events/${eventId}`;
}

