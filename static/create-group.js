// Create Group Form elements and listeners
const openFormButton = document.querySelector(".openFormButton");
const closeFormButton = document.getElementById("closeFormButton");
const formContainer = document.getElementById("formContainer");

openFormButton.addEventListener("click", () => {
    formContainer.classList.remove("hidden");
});
closeFormButton.addEventListener("click", (event) => {
    event.preventDefault();
    formContainer.classList.add("hidden");
});
formContainer.addEventListener("click", (event) => {
    if (event.target === formContainer) {
        formContainer.classList.add("hidden");
    }
});

// Get a reference to the form and the input field
const form = document.querySelector('form');
const input = document.querySelector('#groupName');

// Add an event listener to the form's submit event
form.addEventListener('submit', (event) => {
    if (input.value.trim().length < 1) {
        event.preventDefault();
        alert('Please enter a group name');
    }
});