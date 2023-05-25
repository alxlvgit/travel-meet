// This folder contains AJAX routes for the events page
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { totalNumberOfPeopleForEvent } = require('../helper-functions/events-helpers');
const { ensureAuthenticated } = require('../passport-middleware/check-auth');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion,
});

// Get groups for event
router.get('/groups/:eventId', async (req, res) => {
    const groups = await prisma.group.findMany({
        where: {
            eventId: `${req.params.eventId}`,
        },
        include: {
            members: true,
        },
    });
    const totalNumberOfPeople = await totalNumberOfPeopleForEvent(groups);
    res.json({ totalNumberOfPeople: totalNumberOfPeople });
}
);

// Get group
router.get('/group/:groupId', async (req, res) => {
    const group = await prisma.group.findUnique({
        where: {
            id: Number(req.params.groupId),
        },
        include: {
            members: true,
        },
    });
    if (group && group.members) {
        for (const member of group.members) {
            const params = {
                Bucket: bucketName,
                Key: member.profileImageURI,
            };
            const command = new GetObjectCommand(params);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            member.profileImageURI = url;
        };
    }
    res.json({ group: group, userId: req.user.id });
}
);


router.put(`/groups/:groupId/join`, ensureAuthenticated, async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;
    try {
        const updatedGroup = await prisma.group.update({
            where: {
                id: Number(groupId),
            },
            data: {
                members: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
        res.json({ updatedGroup: updatedGroup });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
}
);


router.put(`/groups/:groupId/leave`, ensureAuthenticated, async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;
    try {
        const updatedGroup = await prisma.group.update({
            where: {
                id: Number(groupId),
            },
            data: {
                members: {
                    disconnect: {
                        id: userId,
                    },
                },
            },
        });
        res.json({ updatedGroup: updatedGroup });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
}
);

module.exports = router;