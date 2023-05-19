
const feedsButton = document.getElementById('feed-link');
const feedsContainer = document.getElementById('feeds-container');
const footerButtons = document.querySelectorAll('.footer-btn');
const exploreButton = document.getElementById('explore-btn');

// Fetch from backend
const getPosts = async (category) => {
  try {
    const response = await fetch(`/api-posts/posts?limit=20&category=${category}`, { signal: abortController.signal });
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
  postLink.classList.add('w-full', 'h-full', 'absolute', 'z-10');
  const card = document.createElement('div');
  card.classList.add(
    'relative',
    'post-card',
    'flex',
    'flex-col',
    'justify-between',
    'items-center',
    'border',
    'border-gray-100',
    'rounded-xl',
    'shadow-md',
    'mb-4',
    'h-64',
    'w-10/12',
    'box-border',
    'overflow-hidden',
    'hover:shadow-lg',
    'cursor-pointer',
    'm-auto',
    'bg-gray-50',
    'max-w-sm',
    'sm:max-w-full',
    "sm:mb-5",
    "sm:h-72",
    "sm:w-11/12",
    "lg:w-10/12",
    "lg:mb-8",
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
    for (const post of posts) {
      const { postLink, card } = await createPostCard(post);
      card.innerHTML = `
      <div class="w-full h-3/4 flex justify-center items-center">
      <img src="${post.imageUrl}" class="object-cover rounded-xl h-full w-full max-w-full" alt="${post.caption}">
    </div>
    <div class='flex flex-col justify-evenly p-1 items-center w-full overflow-hidden'>
      <h3 class='text-md font-semibold line-clamp-1 w-11/12 sm:text-xl text-center'>${post.title}</h3>
      <div class="flex items-center justify-between h-1/4 w-full px-4 pb-2 mt-2">
        <div class="flex items-center justify-center mr-2 relative" > 
        <a class= "absolute w-full h-full top-0 left-0 z-20" href="/user-profile/${post.author.id}">
        </a>
        <img src="${post.author.profileImageURI}" class="w-4 h-4 sm:h-6 sm:w-6 rounded-full mr-1" alt="${post.author.name}">
        <p class='text-xs sm:text-sm text-left line-clamp-2'>
      ${post.author.name}
      </p>
      </div>
      <p class='text-xs sm:text-sm text-center mr-2'>
        <i class="fas fa-map-marker-alt text-center w-4 h-4 mr-1 text-black"></i>${post.location}
      </p>
      <p class='text-xs sm:text-sm text-center line-clamp-2'>
        <i class="far fa-calendar-alt text-center w-4 h-4 mr-1 text-black"> </i>${new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  </div>
    `
      card.appendChild(postLink);
      container.appendChild(card);
    };
  } catch (error) {
    console.log(error);
  }
}

// Filter feeds handler
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
  await getCurrentUserLocation();
  await filterFeedsByCategories(defaultSortBtn);
}

feedsButton.addEventListener('click', async () => {
  await feedsButtonHandler();
});

// Render feeds, set default sort button to active, set events button to active
window.addEventListener('DOMContentLoaded', async () => {
  try {
    feedsButton.classList.add('active');
    eventsButton.classList.remove('active');
    footerButtons.forEach(btn => {
      btn.classList.remove('text-[#878d26]');
    });
    exploreButton.classList.add('text-[#878d26]');
    await getCurrentUserLocation();
    await filterFeedsByCategories(defaultSortBtn);
  } catch (error) {
    console.log(error);
  }
});