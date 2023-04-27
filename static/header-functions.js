document.addEventListener('DOMContentLoaded', function () {
  let links = document.querySelectorAll('a');
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function () {
      var activeLink = document.querySelector('a.active');
      if (activeLink) {
        activeLink.classList.remove('active');
      }
      this.classList.add('active');
    });
  }
});
