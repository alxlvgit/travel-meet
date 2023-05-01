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





// Create function to pull posts from database
// Max 10 posts

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
  postLink.classList.add('w-full', 'h-full');
  const postImage = document.createElement('img'); //Change later for cloud storage
  postImage.src = post.imageURI;
  postImage.classList.add('w-full', 'h-full', 'object-cover');
  postLink.appendChild(postImage);
  const createPostCard = document.createElement('div');
  createPostCard.classList.add('post-card', 'flex', 'flex-col', 'justify-between', 'items-center', 'p-4', 'border', 'border-gray-100', 'rounded-xl', 'shadow-md', 'mb-3', 'ml-5', 'mr-5', 'h-48', 'box-border', 'overflow-hidden', 'hover:shadow-lg', 'cursor-pointer');
  const postCreator = document.createElement('p');
  postCreator.textContent = post.authorId;
  postCreator.classList.add('text-sm', 'text-gray-500', 'font-semibold');
  const postContent = document.createElement('p');
  postContent.textContent = post.content;
  // const postLocation = document.createElement('p');
  // postLocation.textContent = post.location; // add later
  // postLocation.classList.add('text-xs', 'text-gray-500', 'font-semibold');
  const postDate = document.createElement('p');
  postDate.textContent = new Date();
  postDate.classList.add('text-xs', 'text-gray-500', 'font-semibold');
  return { 
    createPostCard, 
    postLink,  
    postImage, 
    postCreator,
    postContent, 
    postDate 
  };
}

const renderPosts = async () => {
  container.innerHTML = '';
  const posts = await getPosts();
  posts.forEach(async (post) => {
    const { postLink, postCreator, postDate, postContent } = await createPostCard(post);
    const card = document.createElement('div');
    card.appendChild(postCreator);
    // classlist.add('post-card', 'flex', 'flex-col', 'justify-between', 'items-center', 'p-4', 'border', 'border-gray-100', 'rounded-xl', 'shadow-md', 'mb-3', 'ml-5', 'mr-5', 'h-48', 'box-border', 'overflow-hidden', 'hover:shadow-lg', 'cursor-pointer' )
    card.appendChild(postLink);
    card.appendChild(postContent);
    card.appendChild(postDate);
    container.appendChild(card);
  });
}

feedsButton.addEventListener('click', () => {
    container.innerHTML = "";
    sortEventsButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    feedsButton.classList.add('active');
    eventsButton.classList.remove('active');
    const testText = document.createElement('p');
    testText.textContent = "This is a test";
    container.appendChild(testText);
    renderPosts();
});




