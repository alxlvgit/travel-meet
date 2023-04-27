
const container = document.querySelector('.container');
const eventsButton = document.getElementById("event-link");

// Get events from Ticketmaster API
const getEvents = async () => {
  const API_KEYS = await getSecretKeys();
  let { TICKETMASTER_API_KEY } = API_KEYS;
  const API_URL = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&latlong=49.2827,-123.1207&unit=km&radius=50&sort=date,asc`;
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const events = data._embedded;
    return events;
  }
  catch (error) {
    console.log(error);
  }
}

// Filter events to get 10 events with unique names
const filterEvents = async (maxNumber) => {
  const allFoundEvents = await getEvents();
  const uniqueNames = [];
  const uniqueEvents = [];
  allFoundEvents.events.some(event => {
    if (!uniqueNames.includes(event.name)) {
      uniqueNames.push(event.name);
      uniqueEvents.push(event);
    }
    return uniqueEvents.length >= maxNumber;
  });
  console.log(uniqueEvents);
  return uniqueEvents;
};

// Get groups for event
const getGroups = async (eventId) => {
  try {
    const response = await fetch(`/api-routes/groups/${eventId}`, {
      method: 'GET'
    })
    const data = await response.json();
    if (data) {
      return data.groups;

    } else {
      console.log("Something went wrong");
    }
  }
  catch (error) {
    console.log(error);
  }
}

// Create event card
const createEventCard = async (event) => {
  const eventLink = document.createElement('a');
  eventLink.href = `/events/${event.id}`;
  eventLink.classList.add('w-full', 'h-full');
  const eventImage = event.images.filter(image => image.ratio === '3_2' && image.width === 1024);
  const eventGroups = await getGroups(event.id);
  const eventCard = document.createElement('a');
  const eventPriceRange = event.priceRanges ? `${event.priceRanges[0].min}-${event.priceRanges[0].max} ${event.priceRanges[0].currency}` : "N/A";
  eventCard.classList.add('event-card', 'flex', 'flex-row', 'justify-between', 'items-center', 'p-4', 'border', 'border-gray-100', 'rounded-xl', 'shadow-md', 'mb-3', 'ml-5', 'mr-5', 'h-48', 'box-border', 'overflow-hidden', 'hover:shadow-lg', 'cursor-pointer');
  return { eventCard, eventLink, eventImage, eventGroups, eventPriceRange };
}

// Render events to DOM
const renderEvents = async () => {
  container.innerHTML = '';
  const events = await filterEvents(10);
  events.forEach(async (event) => {
    const { eventCard, eventLink, eventImage, eventGroups, eventPriceRange } = await createEventCard(event);
    eventCard.innerHTML = `
          <div class="event-image h-full justify-center items-center flex w-1/2">
            <img src="${eventImage[0].url}" class="rounded-xl h-4/5 object-cover sm:h-full" alt="${event.name}">
          </div>
          <div class='flex flex-col justify-between items-start ml-4 w-1/2 box-border overflow-hidden'>
              <h3 class='text-md font-semibold line-clamp-2 sm:text-xl'>${event.name}</h3>
              <p class='text-xs mb-1 text-gray-500 sm:text-sm'>
              <i class="fas fa-map-marker-alt text-center w-4 h-4 mr-1 text-black"></i>${event._embedded.venues[0].city.name}
            </p>
            <p class='text-xs mb-1 text-gray-500 sm:text-sm'>
              <i class="far fa-calendar-alt text-center w-4 h-4 mr-1 text-black"> </i>${event.dates.start.localDate}
            </p>
            <p class='text-xs mb-1 text-gray-500 sm:text-sm'>
              <i class="far fa-clock w-4 h-4 text-center mr-1 text-black"></i>${new Date(event.dates.start.dateTime).toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p class='text-xs mb-1 text-gray-500 align-middle sm:text-sm'>
              <i class="fas fa-dollar-sign text-center w-4 h-4 mr-1 text-black"></i>${eventPriceRange}
            </p>
            <p class='text-xs mb-1 text-gray-500 align-middle sm:text-sm'>
              <i class="fas fa-users text-center w-4 h-4 mr-1 text-black"></i>${eventGroups.length}
            </p>
              <!-- <a href="${event.url}" class="bg-button hover:bg-button-hover text-white font-bold py-1 px-1 rounded text-xs sm:py-2 px-2 text-sm">Get Tickets</a> -->
          </div>
        `;
    eventLink.appendChild(eventCard);
    container.appendChild(eventLink);
  });
}

// Show events on click
eventsButton.addEventListener('click', () => {
  console.log("test events btn");
  renderEvents();
});

window.onload = renderEvents();

