
const feedsButton = document.getElementById('feed-link');
const feedsContainer = document.getElementById('feeds-container');

// Fetch from backend
const getPosts = async (category) => {
  try {
    const response = await fetch(`/api-posts/posts?limit=10&category=${category}`, { signal: abortController.signal });
    const data = await response.json();
    if (data) {
      console.log(data);
      return data.posts;
    } else {
      console.log("Something went wrong");
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error("Get posts fetch aborted. Aborted all pending feeds request.");
    } else {
      console.log(error);
    }
  };
}

// Create function to create post cards
const createPostCard = async (post) => {
  const postLink = document.createElement('a');
  postLink.href = `/posts/${post.id}`;
  postLink.classList.add('w-full', 'h-full', 'absolute');
  const card = document.createElement('div');
  card.classList.add(
    'relative',
    'event-card',
    'flex',
    'flex-col',
    'justify-center',
    'items-center',
    'border',
    'border-gray-100',
    'rounded-xl',
    'shadow-md',
    'mb-4',
    'h-84',
    'box-border',
    'overflow-hidden',
    'hover:shadow-lg',
    'cursor-pointer',
    'mx-5',
    'bg-gray-50',
    'sm:w-7/12',
    'sm:mb-5',
    'sm:m-auto',
  );
  return {
    card,
    postLink,
  };
}

const renderPosts = async (category) => {
  cancelRequests();
  container.innerHTML = '';
  try {
    const posts = await getPosts(category);
    posts.forEach(async (post) => {
      const { postLink, card } = await createPostCard(post);
      card.innerHTML = `
    <div class="w-full h-40 sm:h-60 flex justify-center items-center">
    <img src="${post.imageURI}" class="object-cover rounded-xl h-full w-full max-w-full max-h-full" alt="${post.altText}">
  </div>
  <div class='flex flex-col justify-center items-center w-full'>
    <h3 class='text-md font-semibold line-clamp-1 sm:text-xl text-center mt-2'>${post.title}</h3>
    <div class="flex items-center justify-between w-full px-4 pb-2 lg:w-1/2 sm:w-3/4 mt-2">
      <div class="flex items-center justify-center mr-2">
      <img src="${post.author.profileImageURI}" class="w-4 h-4 rounded-full mr-1" alt="${post.author.name}">
      <p class='text-xs sm:text-sm text-center'>
      ${post.author.name}
      </p>
      </div>
      <p class='text-xs sm:text-sm text-center mr-2'>
        <i class="fas fa-map-marker-alt text-center w-4 h-4 mr-1 text-black"></i>${post.location}
      </p>
      <p class='text-xs sm:text-sm text-center'>
        <i class="far fa-calendar-alt text-center w-4 h-4 mr-1 text-black"> </i>${new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  </div>
    `
      card.appendChild(postLink);
      container.appendChild(card);
    });
  } catch (error) {
    console.log(error);
  }
}

// Sort feeds handler
const filterFeedsByCategories = async (button) => {
  const category = button.dataset.apiQuery;
  const outdoorsIcon = document.querySelector('.outdoors')
  outdoorsIcon ? outdoorsIcon.classList.remove('hidden') : null;
  filteringButtons.forEach(btn => {
    btn.classList.remove('active-icon');
  });
  defaultSortBtn.classList.add('active-icon');
  await renderPosts(category);
}

// Handler for feeds button
const feedsButtonHandler = async () => {
  // Cancel any pending requests
  cancelRequests();
  container.innerHTML = "";
  feedsButton.classList.add('active');
  eventsButton.classList.remove('active');
  await filterFeedsByCategories(defaultSortBtn);
}

feedsButton.addEventListener('click', () => {
  feedsButtonHandler();
});

// Render feeds, set default sort button to active, set events button to active
window.onload = feedsButton.classList.add('active'), filterFeedsByCategories(defaultSortBtn);