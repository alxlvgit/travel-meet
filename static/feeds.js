
const feedsButton = document.getElementById('feed-link');

const feedsContainer = document.getElementById('feeds-container');

// Sorting buttons handler for feeds
const sortFeeds = async (button) => {
    console.log("sortFeeds function called");

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
  postLink.classList.add('w-full', 'h-3/4', 'absolute');
  const card = document.createElement('div');
  card.classList.add(
    'event-card',
    'flex',
    'flex-col',
    'justify-center',
    'items-center',
    'p-4',
    'border',
    'border-gray-100',
    'rounded-xl',
    'shadow-md',
    'mb-3',
    'mx-2',
    'h-84',
    'box-border',
    'overflow-hidden',
    'hover:shadow-lg',
    'cursor-pointer'
  );
  return {
    card,
    postLink,
  };
}

// Render posts to DOM
const renderPosts = async () => {
  container.innerHTML = '';
  const posts = await getPosts();
  posts.forEach(async (post) => {
    const { postLink, card } = await createPostCard(post);
    card.innerHTML = `
    <div class="w-full h-40 flex justify-center items-center">
    <img src="${post.imageURI}" class="object-cover rounded-xl h-5/6 w-1/2 max-w-full max-h-full" alt="${post.title}">
  </div>
  <div class='flex flex-col justify-center items-center w-full'>
    <h3 class='text-md font-semibold line-clamp-2 sm:text-xl text-center mt-3'>${post.title}</h3>
    <div class="flex items-center justify-center w-full mt-2">
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
  </div>
  
  
    `
        card.appendChild(postLink);
        container.appendChild(card);
    });
}
<<<<<<< HEAD

// Handler for feeds button
const feedsButtonHandler = async () => {
    // Cancel any pending requests
    cancelRequests();
    abortPendingEventsCreation = true;
    container.innerHTML = "";
    feedsButton.classList.add('active');
    eventsButton.classList.remove('active');
    const outdoorsIcon = document.querySelector('.outdoors')
    outdoorsIcon ? outdoorsIcon.classList.remove('hidden') : null;
    sortingButtons.forEach(btn => {
        btn.classList.remove('active-icon');
    });
    defaultSortBtn.classList.add('active-icon');
    await renderPosts();
}


// Handler for feeds button
const feedsButtonHandler = async () => {
    // Cancel any pending requests
    cancelRequests();
    abortPendingEventsCreation = true;
    container.innerHTML = "";
    feedsButton.classList.add('active');
    eventsButton.classList.remove('active');
    const outdoorsIcon = document.querySelector('.outdoors')
    outdoorsIcon ? outdoorsIcon.classList.remove('hidden') : null;
    sortingButtons.forEach(btn => {
        btn.classList.remove('active-icon');
    });
    defaultSortBtn.classList.add('active-icon');
    await renderPosts();
}


feedsButton.addEventListener('click', () => {
    feedsButtonHandler();
});
