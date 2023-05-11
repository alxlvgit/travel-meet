module.exports = (io) => {
    const router = require('express').Router();

    // Configure Redis
    const Redis = require('ioredis');
    const redis = new Redis({ host: `${process.env.REDIS_HOST}`, port: `${process.env.REDIS_PORT}`, password: `${process.env.REDIS_PASSWORD}` });
    const usersInRoom = new Set();

    // For testing purposes only. Store test locations in Redis
    const storedLocations = [{ userId: "1", lat: 49.25, lng: -123.0035 }, { userId: "2", lat: 49.3043, lng: -123.1443 }, { userId: "3", lat: 49.2768, lng: -123.1120 }, { userId: "4", lat: 49.2827, lng: -123.1207 }, { userId: "5", lat: 49.2024, lng: -123.1000 }];

    // Store test locations in Redis
    storedLocations.forEach((location) => {
        redis.geoadd('locations', location.lng, location.lat, location.userId);
        console.log('location added to redis', location);
        redis.expire('locations', 600, function (err, reply) {
            if (err) throw err;
            // console.log(reply, "reply"); // output: 1
        });
    });

    // Handle event for when a user requests all stored locations in the radius of 10km
    const getStoredLocations = (socket, io) => {
        socket.on('getStoredLocations', ({ lat, lng, userId }) => {
            // console.log(`storedLocations event emitted. Getting stored locations from Redis for user ${userId}`);
            redis.georadius('locations', lng, lat, 10, 'km', 'WITHDIST', 'WITHCOORD', 'ASC', (err, locations) => {
                if (err) {
                    console.log(err);
                } else {
                    const nearbyUsers = locations.map((result) => ({
                        userId: result[0],
                        distance: result[1],
                        lng: result[2][0],
                        lat: result[2][1],
                    }));
                    // console.log(nearbyUsers, "user will receive storedLocations event with nearby users");
                    const data = { userId, nearbyUsers }
                    io.emit('storedLocations', data);
                }
            });
        });
    };

    // Handle event for when a user shares their location
    const addUserToRedis = async (socket, io) => {
        socket.on('addNewSharedLocation', async ({ userId, lat, lng }) => {
            console.log(`Add user. Adding new user ${userId} to Redis`);
            redis.geoadd('locations', lng, lat, userId);
            redis.georadius('traversingPositions', lng, lat, 20, 'km', 'WITHDIST', 'WITHCOORD', 'ASC', (err, locations) => {
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
                        io.to(user.userId).emit('newLocation', { userId, lat, lng });
                    });
                }
            });
        });
    };

    // Handle event for when a user removes their location
    const removeUserFromRedis = (socket, io) => {
        socket.on('removeSharedLocation', ({ userId, lat, lng }) => {
            console.log(`remove shared location event emitted. Removing user ${userId} location from Redis`);
            redis.zrem('locations', userId);
            redis.georadius('traversingPositions', lng, lat, 20, 'km', 'WITHDIST', 'WITHCOORD', 'ASC', (err, locations) => {
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
                        io.to(user.userId).emit('removeLocation', { userId, lat, lng });
                    });
                }
            });
        });
    };

    // Handle join event for when a user opens the meet map
    const handleUserThatOpenedMeetMap = (socket, io) => {
        socket.on('join', ({ userId, lat, lng }) => {
            console.log('join event emitted. Adding new user to room');
            if (usersInRoom.has(userId)) {
                console.log(`User ${userId} has already joined the room`);
            } else {
                socket.join(userId);
                usersInRoom.add(userId);
                console.log(usersInRoom, "usersInRoom after adding user");
            }
        });
    };

    // Handle leave event for when a user closes the meet map
    const handleUserThatClosedMeetMap = (socket, io) => {
        socket.on('leave', ({ userId, lat, lng }) => {
            console.log('leave event emitted. Removing user from room');
            socket.leave(userId);
        });
    };

    // Handle event for when a user is traversing on the map
    const addUserTraversingPosition = (socket, io) => {
        socket.on('userTraversingOnMap', ({ userId, lat, lng }) => {
            // console.log('user traversing on map event emitted. Adding user and location to Redis');
            // console.log(userId, "userId", lat, "lat", lng, "lng", "user's position on map");
            redis.geoadd('traversingPositions', lng, lat, userId);
            redis.expire('traversingPositions', 600, function (err, reply) {
                if (err) throw err;
                // console.log(reply, "reply"); // output: 1
            });
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
    router.get('/', (req, res) => {
        res.render('./meet-map-views/meet-map', { user: req.session.user });
    });

    return router;
}