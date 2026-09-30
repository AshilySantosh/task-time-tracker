"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailySummaryController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const getDailySummaryController = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const summary = await (0, dashboard_service_1.getDailySummary)(userId);
        return res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getDailySummaryController = getDailySummaryController;
