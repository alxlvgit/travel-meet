const { ensureAuthenticated } = require('../passport-middleware/check-auth');

module.exports = (io) => {
    const router = require('express').Router();

    // Configure Redis
    const Redis = require('ioredis');
    const redis = new Redis({ host: `${process.env.REDIS_HOST}`, port: `${process.env.REDIS_PORT}`, password: `${process.env.REDIS_PASSWORD}` });
    const usersInRoom = new Set();

    // For testing purposes only. Store shared test locations and icons in Redis
    const storedLocations = [{ userId: "15", lat: 49.2689, lng: -123.0035, iconUrl: "https://indianmemetemplates.com/wp-content/uploads/fu-that-yao-ming.jpg" },
    { userId: "16", lat: 49.3043, lng: -123.1443, iconUrl: "https://wallpaper.dog/large/10747737.jpg" },
    { userId: "17", lat: 49.2768, lng: -123.1120, iconUrl: "https://www.shutterstock.com/image-vector/vector-guy-meme-face-any-260nw-491615011.jpg" },
    { userId: "18", lat: 49.2827, lng: -123.1207, iconUrl: "https://rlv.zcache.com/awesome_face_rage_f7u12_funny_meme_classic_round_sticker-r35ccef514463441b9ace70325551f930_0ugmp_8byvr_307.jpg" },
    { userId: "19", lat: 49.2024, lng: -123.1000, iconUrl: "https://static.vecteezy.com/system/resources/previews/000/439/863/original/vector-users-icon.jpg" }];

    // Store test locations in Redis
    storedLocations.forEach((location) => {
        redis.geoadd('locations', location.lng, location.lat, location.userId);
        redis.hset('userIcons', location.userId, location.iconUrl);
        // to remove test shared locations and icons from redis:
        // redis.zrem('locations', "2");
        // redis.hdel('userIcons', "2");
        console.log('test location with icon added to redis', location);
    });

    // Handle event for when a user requests all stored locations in the radius of 20km
    const getStoredLocations = (socket, io) => {
        socket.on('getStoredLocations', async ({ lat, lng, userId }) => {
            await redis.georadius('locations', lng, lat, 20, 'km', 'WITHDIST', 'WITHCOORD', 'ASC', async (err, locations) => {
                if (err) {
                    console.log(err);
                } else {
                    const nearbyUsers = locations.map((result) => ({
                        userId: result[0],
                        distance: result[1],
                        lng: result[2][0],
                        lat: result[2][1],
                    }));
                    const icons = {};
                    for (user of nearbyUsers) {
                        await redis.hget('userIcons', user.userId, (err, icon) => {
                            if (err) {
                                console.log(err);
                            } else {
                                icons[user.userId] = icon;
                            }
                        });
                    };
                    const data = { userId, nearbyUsers, icons }
                    // console.log(data, "data");
                    socket.emit('storedLocations', data);
                }
            });
        });
    };

    // Handle event for when a user shares their location
    const addUserToRedis = async (socket, io) => {
        socket.on('addNewSharedLocation', async ({ userId, lat, lng, iconUrl }) => {
            console.log(`Add user. Adding new user ${userId} to Redis`);
            await redis.geoadd('locations', lng, lat, userId);
            await redis.hset('userIcons', userId, iconUrl);
            await redis.georadius('traversingPositions', lng, lat, 50, 'km', 'WITHDIST', 'WITHCOORD', 'ASC', (err, locations) => {
                if (err) {
                    console.log(err);
                } else {
                    let nearbyUsers = locations.map((result) => ({
                        userId: result[0],
                        distance: result[1],
                        lng: result[2][0],
                        lat: result[2][1],
                    }));
                    nearbyUsers = nearbyUsers.filter((user) => user.userId !== userId);
                    console.log(nearbyUsers, `nearby users after adding new user ${userId} to Redis`);
                    nearbyUsers.forEach((user) => {
                        console.log("emitting addLocation event to user " + user.userId + " from user " + userId + " that removed their location");
                        io.to(`${user.userId}`).emit('newLocation', { userId: userId, lat, lng, iconUrl });
                    });
                }
            });
        });
    };

    // Handle event for when a user removes their location
    const removeUserFromRedis = (socket, io) => {
        socket.on('removeSharedLocation', async ({ userId, lat, lng }) => {
            console.log(`remove shared location event emitted.Removing user ${userId} location from Redis`);
            await redis.zrem('locations', userId);
            await redis.hdel('userIcons', userId);
            await redis.georadius('traversingPositions', lng, lat, 50, 'km', 'WITHDIST', 'WITHCOORD', 'ASC', (err, locations) => {
                if (err) {
                    console.log(err);
                } else {
                    let nearbyUsers = locations.map((result) => ({
                        userId: result[0],
                        distance: result[1],
                        lng: result[2][0],
                        lat: result[2][1],
                    }));
                    nearbyUsers = nearbyUsers.filter((user) => user.userId !== userId);
                    console.log(nearbyUsers, `nearby users will receive the event that user ${userId} removed their location`);
                    nearbyUsers.forEach((user) => {
                        console.log("emitting removeLocation event to user" + user.userId + "from user" + userId + "that removed their location");
                        io.to(`${user.userId}`).emit('removeLocation', { userId });
                    });
                }
            });
        });
    };

    // Handle join event for when a user opens the meet map. Add them to the room
    const handleUserThatOpenedMeetMap = (socket, io) => {
        socket.on('join', ({ userId, lat, lng }) => {
            if (usersInRoom.has(userId)) {
                console.log(`User ${userId} has already joined the room`);
            } else {
                socket.join(userId);
                usersInRoom.add(userId);
                console.log(usersInRoom, "usersInRoom after adding user");
            }
        });
    };

    // Handle leave event for when a user closes the meet map. Remove them from the room
    const handleUserThatClosedMeetMap = (socket, io) => {
        socket.on('leave', ({ userId, lat, lng }) => {
            console.log('leave event emitted. Removing user from room');
            socket.leave(userId);
        });
    };

    // Track user traversing on map to show them if someone is starting to share their location
    // close to the position on the map they are currently viewing
    // This is for users that are not sharing their location themselves but are just viewing the map
    const addUserTraversingPosition = (socket, io) => {
        socket.on('userTraversingOnMap', async ({ userId, lat, lng }) => {
            await redis.geoadd('traversingPositions', lng, lat, userId);
        });
    };

    // Set up event listeners for Socket.io connections
    io.on('connection', (socket) => {
        console.log('user connected');
        handleUserThatOpenedMeetMap(socket, io);
        handleUserThatClosedMeetMap(socket, io);
        getStoredLocations(socket, io);
        addUserTraversingPosition(socket, io);
        addUserToRedis(socket, io);
        removeUserFromRedis(socket, io);
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    // Meet map route
    router.get('/', ensureAuthenticated, (req, res) => {
        res.render('./meet-map-views/meet-map', { user: req.user });
    });

    return router;
}