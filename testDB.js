const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Add a new user
async function addUser() {
  const user = await prisma.user.create({
    data: {
      name: 'Brett Gill',
      email: 'brett@mail.com',
      password: 'secret'
    }
  })
  console.log(user)
}

async function addPosts() {
  const post = await prisma.post.create({
    data: {
      title: 'Belize is the best!',
      createdAt: new Date(),
      caption: 'This is a beautiful place!',
      imageURI: 'https://cdn.pixabay.com/photo/2023/01/18/12/39/river-7726732__480.jpg',
      altText: 'Beautiful Belize',
      location: 'Belize',
      category: 'travel',
      author: {
        connect: { id: 1 }
      },
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
        connect: { id: "rZ7HnEZ1A30vAP" }
      },
      members: {
        connect: { id: 2 }
      },
      creatorMessage: 'Welcome to my group!'
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

try {
    createGroup();
}
catch (e) {
    console.error(e);
}

// try {
//   addPosts();
// }
// catch (e) {
//   console.error(e);
// }