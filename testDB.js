const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Add a new user
async function addUser() {
  const user = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
      password: 'secret'
    }
  })
  console.log(user)
}

async function addPosts() {
  const post = await prisma.post.create({
    data: {
      title: 'Peter Parker',
      content: 'TravelMeet is a great app!',
      imageName: 'prisma-day-2020.png',
      caption: 'TravelMeet is a great app!',
      imageURI: 'https://www.prisma.io/day/',
      authorId: 1
    }
  })
  console.log(post)
}

// Add a new event
async function addEvent() {
  const newEvent = await prisma.event.create({
    data: {
      id: "G5v7Z94lcIfq4", // the Ticketmaster id of the event
      name: "Event name",
      date: new Date(),
      venue: "The location of the event",
      latitude: 12.3456, // the latitude of the event location
      longitude: -98.7654, // the longitude of the event location
    },
  });
  console.log(`New event created with id: ${newEvent.id}`);
}


// Create a new group with a creator, event, and members
async function createGroup() {
  const newGroup = await prisma.group.create({
    data: {
      name: 'My new group',
      creator: {
        connect: { id: 1 }
      },
      event: {
        connect: { id: "G5v7Z94lcIfq4" }
      },
      members: {
        connect: { id: 2 }
      }
    }
  })
  console.log(`New group created with id: ${newGroup.id}`)
}

// try {
//     addUser();
// } catch (error) {
//     console.log(error);
// }

// try {
//     addEvent();
// }
// catch (e) {
//     console.error(e);
// }

// try {
//     createGroup();
// }
// catch (e) {
//     console.error(e);
// }
// try {
//     addPosts();
// } catch (error) {
//     console.log(error);
// }

