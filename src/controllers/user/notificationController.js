const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getNotification = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const notifications = await prisma.notifications.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (notifications.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No notifications found for the user."
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Notifications retrieved successfully.",
            data: notifications
        });

    } catch (error) {
        console.error("Failed to retrieve notifications: ", error);
        next(error);
    }
};

const readNotificationById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const notificationId = parseInt(req.params.notificationId);

        if (isNaN(notificationId)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid notification ID provided."
            });
        }

        const notification = await prisma.notifications.findUnique({
            where: {
                id: notificationId,
                userId: userId 
            }
        });

        if (!notification) {
            return res.status(404).json({
                status: "error",
                message: "Notification not found."
            });
        }

        if (!notification.isRead) {
            await prisma.notifications.update({
                where: { id: notificationId },
                data: { isRead: true }
            });
        }

        const updatedNotification = await prisma.notifications.findUnique({
            where: {
                id: notificationId,
                userId: userId 
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Notification retrieved successfully.",
            data: updatedNotification
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {getNotification, readNotificationById};
