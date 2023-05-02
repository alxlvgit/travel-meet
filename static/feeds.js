const feedsButton = document.getElementById("feed-link");

feedsButton.addEventListener('click', () => {
    container.innerHTML = "";
    sortingButtons.forEach(btn => {
        btn.classList.remove('active-icon');
    });
    eventsButton.classList.remove('active');
    feedsButton.classList.add('active');
    const testText = document.createElement('p');
    testText.textContent = "This is a test";
    container.appendChild(testText);
    //todo: append one more icon to the header for hiking when feeds open
});

// Sorting buttons handler for feeds
const sortFeeds = async (button) => {
  console.log("sort feeds here based on category click");

}


// Fetch from backend

const getPosts = async () => {
  try {
    const response = await fetch('/api-posts/posts', {
      method: 'GET'
    })
    const data = await response.json();
    if (data) {
      console.log(data);
      return data.posts;
    } else {
      console.log("Something went wrong");
    }
  }
  catch (error) {
    console.log(error);
  }
}

// Create function to create post cards
const createPostCard = async (post) => {
  const postLink = document.createElement('a');
  postLink.href = `/posts/${post.id}`;
  postLink.classList.add('w-full', 'h-full', 'absolute', 'top-0', 'left-0', 'z-10');
  const card = document.createElement('div');
  card.classList.add('post-card', 'flex', 'flex-col', 'justify-between', 'items-center', 'p-4', 'border', 'border-gray-100', 'rounded-xl', 'shadow-md', 'mb-3', 'ml-5', 'mr-5', 'h-48', 'box-border', 'overflow-hidden', 'hover:shadow-lg', 'cursor-pointer');
  return {
    card,
    postLink,
  };
}

const renderPosts = async () => {
  container.innerHTML = '';
  const posts = await getPosts();
  posts.forEach(async (post) => {
    const { postLink, card } = await createPostCard(post);
    card.innerHTML = `
    <div class="event-image h-full justify-center items-center flex w-1/2 sm:justify-start">
      <img src="${post.imageURI}" class="rounded-xl h-4/5 object-cover sm:w-full" alt="${post.title}">
    </div>
    <div class='flex flex-col justify-between items-start ml-4 w-1/2 box-border'>
      <h3 class='text-md font-semibold line-clamp-2 sm:text-xl'>${post.title}</h3>
      <p class='text-xs mb-1 text-gray-500 sm:text-sm'>
        <i class="fas fa-users text-center w-4 h-4 mr-1 text-black"></i>${post.authorId}
      </p>
      <p class='text-xs mb-1 text-gray-500 sm:text-sm'>
        <i class="fas fa-map-marker-alt text-center w-4 h-4 mr-1 text-black"></i>${post.location}
      </p>
      <p class='text-xs mb-1 text-gray-500 sm:text-sm'>
        <i class="far fa-calendar-alt text-center w-4 h-4 mr-1 text-black"> </i>${new Date(post.createdAt).toLocaleDateString()}
      </p>
    </div>
    `
    card.appendChild(postLink);
    container.appendChild(card);
  });
  // createOutsideIcon();
}

feedsButton.addEventListener('click', () => {
  container.innerHTML = "";
  sortingButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  feedsButton.classList.add('active');
  eventsButton.classList.remove('active');
  const outdoorsIcon = document.querySelector('.outdoors')
  outdoorsIcon ? outdoorsIcon.classList.remove('hidden') : null;
  renderPosts();
});
