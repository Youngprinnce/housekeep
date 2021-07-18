var express = require('express');
var router = express.Router();
var api = require("../controllers/api")
var models = require("../models")
var {verify_token} = require("../middleware/api_auth")

const fileUpload = require('express-fileupload');
/* GET users listing. */

router.use(fileUpload())

router.post('/user', verify_token, api.get_index_user);

router.post('/manager', verify_token, api.get_index_manager);

router.post("/categories",  verify_token, api.get_all_categories)

router.post("/category-search",  verify_token,api.search_by_category)


router.post("/login-user", api.login_user)

router.post("/login-manager", api.login_manager)

router.post("/maintenance-request", verify_token ,api.request_maintenance)

router.post("/add-observation", verify_token ,api.add_observation)

router.post("/user-tasks-completed", verify_token ,api.get_all_maintenance_user_comp)

router.post("/user-tasks-pending", verify_token ,api.get_all_maintenance_user_pending)

router.post("/user-tasks-all", verify_token ,api.get_all_maintenance_user)

router.post("/manager-maintenances", verify_token ,api.get_all_maintenance_manager)

router.post("/task", verify_token ,api.get_maintenance_user)

router.post("/task-manager", verify_token ,api.get_maintenance_manager)

router.post("/get-priorities", verify_token ,api.priorities_user)

router.post("/get-maintenance-activities", verify_token ,api.get_activities)

router.post("/get-notifications-user", verify_token ,api.get_notifications_user)

router.post("/get-notifications-manager", verify_token ,api.get_notifications_manager)

router.post("/get-all-contractors", verify_token ,api.get_all_contractors)

router.post("/initiate-task", verify_token ,api.initiate_task)

router.post("/get-contractor", verify_token ,api.get_contractor)

router.post("/assign-contractor", verify_token ,api.assign_contractor)

router.post("/forgot-password", api.forgot_password)

router.post("/reset-password", api.reset_password)

router.post("/get-past-due", verify_token, api.get_past_due)

router.post("/today-tasks", verify_token, api.get_today_tasks)

router.post("/high-priority", verify_token, api.get_high_priority)

router.post("/get-general-maintenances", verify_token, api.get_general_maintenances)

router.post("/get-general-maintenance", verify_token, api.get_general_maintenances)

router.post("/progress-activities", verify_token, api.get_activities)

router.post("/complete-task",verify_token, api.approve)

router.post("/complain",verify_token, api.complain)

router.post("/get-user-rents", verify_token, api.get_user_rents)

router.post("/get-expenses", verify_token, api.get_expenses)

router.post("/get-issues", verify_token, api.get_issues)

router.post("/get-not-initiated", verify_token, api.get_not_initiated)

router.post("/get-initiated", verify_token, api.get_initiated);

router.post("/get-today-done", verify_token, api.get_today_complete);

router.post("/get-today-done-manager", verify_token, api.get_today_complete_manager);

router.post("/update-status", verify_token, api.make_status);

router.post("/get-status", api.get_status)

router.post("/notify", api.notify)
module.exports = router;
