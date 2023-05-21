const footerButtons = document.querySelectorAll('.footer-btn');
const addPostBtn = document.getElementById('add-post-btn');
const savePost = document.getElementById('save-post');

// Autocomplete feature for location input
const locationInput = document.getElementById('location-input');
const autocomplete = new google.maps.places.Autocomplete(locationInput);

window.addEventListener('load', () => {
  footerButtons.forEach(btn => {
    btn.classList.remove('text-[#878d26]');
  });
  addPostBtn.classList.add('text-[#878d26]');
}
);

// Temporary disable savePost button
savePost.addEventListener('click', async (event) => {
  event.preventDefault();
  return;
});