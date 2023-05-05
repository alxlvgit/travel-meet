const container = document.querySelector('.container');
const eventsButton = document.getElementById("event-link");
let sortingButtons = document.querySelectorAll(".sort-btn");
const defaultSortBtn = document.getElementById("default-btn");
let apiKeySearchQueryParam = "";

// Create AbortController
let abortController = new AbortController();

// Cancel all pending requests
const cancelRequests = () => {
  abortController.abort();
  abortController = new AbortController();
};

// Get events by using Ticketmaster API
const getEvents = async (signal) => {
  const API_KEYS = await getSecretKeys();
  let { TICKETMASTER_API_KEY } = API_KEYS;
  const querySearchParam = apiKeySearchQueryParam ? `&classificationName=${apiKeySearchQueryParam}` : "&classificationName=art, music, sport, seminar";
  const API_URL = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&latlong=49.2827,-123.1207&unit=km&radius=50&sort=date,asc${querySearchParam}}`;
  try {
    const response = await fetch(API_URL, { signal: signal });
    const data = await response.json();
    const events = data._embedded;
    return events;
  }
  catch (error) {
    if (error.name === 'AbortError') {
      console.log('Aborted all pending events requests. Events fetch aborted.');
    } else {
      console.log(error);
    }
  }
}

// Filter events to try get at least 10 events with unique names
const filterEvents = async (maxNumber, foundEvents) => {
  const uniqueNames = [];
  const uniqueEvents = [];
  foundEvents.events.some(event => {
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
const getPeopleFromAllGroups = async (eventId, signal) => {
  try {
    const response = await fetch(`/api-events/groups/${eventId}`, { signal: signal });
    const data = await response.json();
    if (data) {
      return data;
    } else {
      console.log("Something went wrong");
    }
  }
  catch (error) {
    if (error.name === 'AbortError') {
      throw new Error("Aborted all pending events requests. Groups fetch aborted.");
    } else {
      console.log(error);
    }
  }
}

// Get properly formatted event price range
const eventPricing = (event) => {
  if (event.priceRanges) {
    const min = event.priceRanges[0].min;
    const max = event.priceRanges[0].max;
    const currency = event.priceRanges[0].currency;
    if (min == 0 && max == 0) {
      return `N/A`;
    } else if (min == max) {
      return `${min} ${currency}`;
    } else {
      return `${min}-${max} ${currency}`;
    }
  } else {
    return "N/A";
  }
}

// Create event card
const createEventCard = async (event) => {
  const eventLink = document.createElement('a');
  eventLink.href = `/event/${event.id}`;
  eventLink.classList.add('w-full', 'h-full', "absolute", "top-0", "left-0", "z-10");
  const eventImage = event.images.filter(image => image.ratio === '16_9' && image.width === 2048);
  const eventCard = document.createElement('div');
  const eventPriceRange = eventPricing(event);
  eventCard.classList.add('event-card', 'flex', "relative", 'flex-row', 'justify-between', 'items-center', 'p-4', 'border', 'border-gray-100', 'rounded-xl', 'shadow-md', 'mb-3',
    'ml-5', 'mr-5', 'h-48', 'box-border', 'overflow-hidden', 'hover:shadow-lg', 'cursor-pointer', "sm:h-64", "sm:mb-5", "sm:w-9/12", "sm:m-auto");
  return { eventCard, eventLink, eventImage, eventPriceRange };
}

// Render events to DOM
const renderEvents = async () => {
  // Cancel all pending requests
  cancelRequests();
  try {
    container.innerHTML = "";
    const events = await filterEvents(10, await getEvents(abortController.signal));
    for (const event of events) {
      const { totalNumberOfPeople } = await getPeopleFromAllGroups(event.id, abortController.signal);
      const { eventCard, eventLink, eventImage, eventPriceRange } = await createEventCard(event);
      eventCard.innerHTML = `
        <div class="event-image h-full justify-center items-center flex w-1/2 sm:justify-start">
          <img src="${eventImage[0].url}" class="rounded-xl h-4/5 object-cover sm:h-full w-11/12" alt="${event.name}">
        </div>
        <div class='flex flex-col justify-between items-start ml-4 w-1/2 box-border overflow-hidden'>
            <h3 class='text-md font-semibold line-clamp-2 sm:text-xl'>${event.name}</h3>
            <p class='text-xs mb-1 text-gray-500 sm:text-sm'>
            <i class="fas fa-map-marker-alt text-center w-4 h-4 mr-1 text-black"></i>${event._embedded.venues[0].city.name}
          </p>
          <p class='text-xs mb-1 text-gray-500 sm:text-sm'>
            <i class="far fa-calendar-alt text-center w-4 h-4 mr-1 text-black"> </i>${new Date(event.dates.start.localDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p class='text-xs mb-1 text-gray-500 sm:text-sm'>
            <i class="far fa-clock w-4 h-4 text-center mr-1 text-black"></i>${new Date(event.dates.start.dateTime).toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p class='text-xs mb-1 text-gray-500 align-middle sm:text-sm'>
            <i class="fas fa-dollar-sign text-center w-4 h-4 mr-1 text-black"></i>${eventPriceRange}
          </p>
          <p class='text-xs mb-1 text-gray-500 align-middle sm:text-sm'>
            <i class="fas fa-users text-center w-4 h-4 mr-1 text-black"></i>${totalNumberOfPeople}
          </p>
      `;
      eventCard.appendChild(eventLink);
      container.appendChild(eventCard);
    }
  }
  catch (error) {
    console.log(error);
  }
}

// --------------------- Event listeners and handlers  ---------------------------------

// Events button handler
const showEvents = async () => {
  container.innerHTML = '';
  feedsButton.classList.remove('active');
  eventsButton.classList.add('active');
  const outdoorsIcon = document.querySelector('.outdoors')
  outdoorsIcon ? outdoorsIcon.classList.add('hidden') : null;
  sortingButtons.forEach(btn => {
    btn.classList.remove('active-icon');
  });
  defaultSortBtn.classList.add('active-icon');
  await sortEvents(defaultSortBtn);
}

// Events button listener
eventsButton.addEventListener('click', async () => {
  await showEvents();
});

// Sorting buttons handler
const sortEvents = async (button) => {
  const apiQueryParam = button.dataset.apiQuery;
  apiKeySearchQueryParam = apiQueryParam;
  await renderEvents();
}

// Sorting buttons listener
sortingButtons.forEach(button => {
  button.addEventListener('click', () => {
    eventsButton.classList.contains('active') ? sortEvents(button) : sortFeeds(button);
    // Remove active class from all buttons
    sortingButtons.forEach(btn => {
      btn.classList.remove('active-icon');
    });
    // Add active class to clicked button
    button.classList.add('active-icon');
  });
});


