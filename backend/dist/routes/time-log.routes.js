"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const time_log_controller_1 = require("../controllers/time-log.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get("/", time_log_controller_1.getTimeLogsController);
exports.default = router;
