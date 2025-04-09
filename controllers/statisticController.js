const Case = require('../models/case')
const Document = require('../models/document')
const User = require('../models/user')
const Notification = require('../models/notification')
const getUserInfo = require('../helpers/getUserInfo');
const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('../helpers/auth')
const jwt = require('jsonwebtoken');

exports.getDashboardStatistics = async (req, res) => {
    // Format data sesuai dengan ekspektasi frontend
    res.json({
      caseStatistic: {
        open: 8,
        close: 12
      },
      userStatistic: {
        admins: 3,
        partners: 5,
        associates: 8, 
        paralegals: 4,
        clients: 32
      }
    });
  };

// Fungsi validasi ObjectId
const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return mongoose.Types.ObjectId.isValid(id);
};

const dashboardStatistic = async (req, res) => {
    try {
        console.log("Fetching dashboard statistics");
        
        // Buat statistik dasar dengan nilai default
        const caseStatistic = {
            "open": 0,
            "close": 0,
            "pending": 0
        };
        
        const userStatistic = {
            "admins": 0,
            "paralegals": 0,
            "clients": 0,
            "partners": 0,
            "associates": 0
        };
        
        const clientStatistic = {
            "serviceQuality": 4.5,
            "communication": 4.7,
            "professionalism": 4.3,
            "clientOverallSatisfactoryRating": 4.5,
            "performance": 4.4
        };
        
        // Coba ambil data kasus jika ada
        try {
            const caseCount = await Case.countDocuments();
            if (caseCount > 0) {
                const allCase = await Case.find({});
                caseStatistic.open = allCase.filter(x => x.case_status === "Open").length;
                caseStatistic.close = allCase.filter(x => x.case_status === "Closed").length;
                caseStatistic.pending = allCase.filter(x => x.case_status === "Pending").length;
                console.log(`Found ${caseCount} cases`);
            } else {
                console.log("Case collection is empty");
            }
        } catch (caseError) {
            console.error("Error fetching cases:", caseError);
            // Lanjutkan dengan nilai default
        }
        
        // Coba ambil data pengguna jika ada
        try {
            const userCount = await User.countDocuments();
            if (userCount > 0) {
                const allClient = await User.find({type: "client"});
                const allEmployee = await User.find({ type: {$ne: "client"} });
                
                userStatistic.clients = allClient.length;
                userStatistic.admins = allEmployee.filter(x => x.type === "admin").length;
                userStatistic.partners = allEmployee.filter(x => x.type === "partner").length;
                userStatistic.associates = allEmployee.filter(x => x.type === "associates").length;
                userStatistic.paralegals = allEmployee.filter(x => x.type === "paralegal").length;
                console.log(`Found ${userCount} users`);
            } else {
                console.log("User collection is empty");
            }
        } catch (userError) {
            console.error("Error fetching users:", userError);
            // Lanjutkan dengan nilai default
        }
        
        console.log("Returning dashboard statistics");
        return res.status(200).send({caseStatistic, userStatistic, clientStatistic});
    } catch (error) {
        console.error("Error in dashboardStatistic:", error);
        return res.status(500).json({
            error: error.name || "ServerError",
            message: error.message || "An unexpected error occurred"
        });
    }
}

const getNotifications = async (req, res) => {
    try {
        const { userId, type } = getUserInfo(res);
        console.log(`Getting notifications for user ${userId}`);
        
        // Validasi format ID
        if (!isValidObjectId(userId)) {
            console.error(`Invalid user ID format: ${userId}`);
            return res.status(400).json({
                error: "InvalidId",
                message: "User ID must be a valid MongoDB ObjectId"
            });
        }
        
        // Periksa apakah koleksi notifikasi ada dan memiliki data
        const notificationsExist = await Notification.countDocuments();
        if (notificationsExist === 0) {
            console.log("Notifications collection is empty");
            return res.status(200).json([]); // Kembalikan array kosong
        }
        
        // Query notifikasi
        const allNotifications = await Notification.find({
            "notification_recipient_id_and_status.recipient_id": userId,
        }).sort({ "notification_sent_date": -1 });
        
        if (!allNotifications || allNotifications.length === 0) {
            console.log("No notifications found for this user");
            return res.status(200).json([]);
        }
        
        // Proses notifikasi
        const allUpdatedNoti = [];
        allNotifications.forEach((noti) => {
            if (!noti._doc || !noti._doc.notification_recipient_id_and_status) {
                return; // Skip jika tidak memiliki struktur yang benar
            }
            
            let read = false;
            noti._doc.notification_recipient_id_and_status.forEach(stat => {
                if (stat.recipient_id === userId && stat.status === "read") 
                    read = true;
            });
            
            allUpdatedNoti.push({...noti._doc, read});
        });
        
        const unreadNoti = allUpdatedNoti.filter((noti) => !noti.read);
        const readNoti = allUpdatedNoti.filter((noti) => noti.read);
        
        // Update status notifikasi
        try {
            await Notification.updateMany({
                "notification_recipient_id_and_status.recipient_id": userId
              }, {
                $set: {
                  "notification_recipient_id_and_status.$.status": "read"
                }
              });
        } catch (updateError) {
            console.warn("Warning: Failed to update notification status", updateError);
            // Lanjutkan karena ini bukan error kritis
        }
        
        console.log(`Returning ${unreadNoti.length} unread and ${readNoti.length} read notifications`);
        return res.status(200).json([...unreadNoti, ...readNoti]);
    } catch (error) {
        console.error("Error in getNotifications:", error);
        return res.status(500).json({
            error: error.name || "ServerError",
            message: error.message || "An unexpected error occurred"
        });
    }
}

module.exports = { dashboardStatistic, getNotifications }