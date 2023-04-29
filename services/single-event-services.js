const fetchSingleEvent = async (id) => {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    const url = `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log(error);
    }
}

const filterEventImages = (images) => {
    // This function will filter the images array and return the image with the proper ratio and size
}

module.exports = fetchSingleEvent, filterEventImages;