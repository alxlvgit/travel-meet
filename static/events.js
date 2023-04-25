
const container = document.querySelector('.container');

// Get api keys from server
const getSecretKeys = async () => {
  try {
    const response = await fetch('/secretKeys', {
      method: 'GET'
    })
    const data = await response.json();
    if (data) {
      return JSON.parse(data);
    } else {
      console.log("Something went wrong");
    }
  }
  catch (error) {
    console.log(error);
  }
}

// Get events from Ticketmaster API
const getEvents = async () => {
  const API_KEYS = await getSecretKeys();
  let { TICKETMASTER_API_KEY } = API_KEYS;
  const API_URL = `https://app.ticketmaster.com/discovery/v2/suggest?latlong=49.2500,123.0035&unit=km&radius=50&size=5&apikey=${TICKETMASTER_API_KEY}`;
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(data._embedded.attractions);
    const events = data._embedded;
    return events;
  }
  catch (error) {
    console.log(error);
  }
}

// Render events to DOM
const renderEvents = async () => {
  const events = await getEvents();
  events.attractions.forEach(event => {
    const eventImage = event.images.filter(image => image.ratio === '16_9' && image.width === 640);
    console.log(eventImage[0]);
    const eventCard = document.createElement('div');
    eventCard.classList.add('event-card', 'flex', 'flex-row', 'justify-between', 'items-center', 'p-4', 'border', 'border-gray-300', 'rounded-md', 'shadow-md', 'm-2');
    eventCard.innerHTML = `
          <div class="event-image">
            <img src="${eventImage[0].url}" class="rounded" alt="${event.name}">
          </div>
          <div class='flex flex-col justify-between items-start w-full ml-4'>
            <div>
              <h3 class='text-md font-semibold sm:text-xl'>${event.name}</h3>
              <p class='text-sm text-gray-700 sm:text-md'>${event.classifications[0].genre.name}</p>
              <p class='text-xs text-gray-500 sm:text-sm'>${events.venues[0].city.name}</p>
              <a href="${event.url}" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded text-xs">Buy Tickets</a>
          </div>
        `;
    container.appendChild(eventCard);
  });
}

renderEvents();