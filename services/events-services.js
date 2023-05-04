const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

const filterEventImages = async (images) => {
    // This function will filter the images array and return the image with the proper ratio and size
    const filteredImages = await images.filter(image => image.ratio === '16_9' && image.width === 2048);
    return filteredImages;
}

const getGroups = async (eventId) => {
    try {
        const groups = await prisma.group.findMany({
            where: {
                eventId: eventId
            },
            include: {
                creator: true,
                members: true
            }
        });
        return groups;
    }
    catch (error) {
        console.log(error);
    }
}

const totalNumberOfPeopleForEvent = async (groups) => {
    let totalNumberOfPeople = 0;
    groups.forEach(group => {
        totalNumberOfPeople += group.members.length;
    });
    return totalNumberOfPeople;
}

const checkIfUserIsMemberOrCreator = (group, userId) => {
    let isMember = false;
    let isCreator = false;
    group.members.forEach(member => {
        if (member.id === userId) {
            isMember = true;
        }
    });
    if (group.creator.id === userId) {
        isCreator = true;
    }
    return { isMember, isCreator };
}


module.exports = { fetchSingleEvent, filterEventImages, getGroups, totalNumberOfPeopleForEvent, checkIfUserIsMemberOrCreator };