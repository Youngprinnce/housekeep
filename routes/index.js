var express = require('express');
var router = express.Router();
var indexCont = require("../controllers/index")
var models = require("../models")
var {logout, is_logged_in_get, is_logged_in_post, is_notverified_get, is_notverified_post, is_verified_get, no_auth_get, no_auth_post, has_tags, check_jobs} = require("../middleware/hasAuth")
const fileUpload = require('express-fileupload');


router.use(fileUpload())
/* GET home page. */
router.get('/', no_auth_get, indexCont.get_login);

router.get('/dash', is_logged_in_get, indexCont.get_index)

router.get('/properties', is_logged_in_get, indexCont.get_properties)

router.get('/properties/:id', is_logged_in_get, indexCont.check_for_property, indexCont.get_property)

router.get('/flats/:id', is_logged_in_get, indexCont.check_flat_props, indexCont.get_property_flats)

router.get('/flats', is_logged_in_get, indexCont.get_flats)

router.get('/tasks/:id', is_logged_in_get, indexCont.check_maint, indexCont.get_maint)

router.get('/tasks', is_logged_in_get, indexCont.get_maints)

router.get('/completed', is_logged_in_get, indexCont.get_complete)

router.get('/managers', is_logged_in_get, indexCont.get_managers)

router.get('/contractors', is_logged_in_get, indexCont.get_contractors)

router.get('/tenants', is_logged_in_get, indexCont.get_tenants)

router.get('/categories', is_logged_in_get, indexCont.get_cats)

router.get('/priorities', is_logged_in_get, indexCont.get_priors)

router.get("/refresh-activities", indexCont.get_activities)

router.get("/refresh-observation", indexCont.get_observation)

router.post("/approve-task", is_logged_in_post, indexCont.approve_task)

router.get("/general-tasks", is_logged_in_get, indexCont.get_generals)

router.get('/logout', indexCont.logout)


// start post requests

router.post('/login',no_auth_post, indexCont.login)

router.post('/add-property', is_logged_in_post, indexCont.create_property)

router.post('/add-flat', is_logged_in_post, indexCont.create_flat)

router.post('/add-category',is_logged_in_post, indexCont.add_category)

router.post('/add-priority', is_logged_in_post, indexCont.add_prior)

router.post('/add-tenant',is_logged_in_post, indexCont.add_user)

router.post('/add-manager', is_logged_in_post, indexCont.add_manager)

router.post('/add-contractor', is_logged_in_post, indexCont.add_contractor)

router.post('/edit-tenant', is_logged_in_post, indexCont.edit_user)

router.post('/edit-manager', is_logged_in_post, indexCont.edit_manager)

router.post('/block-tenant', indexCont.block_user)

router.post('/block-manager', indexCont.block_manager)

router.post('/activate-tenant', indexCont.unblock_user)

router.post('/activate-manager',  indexCont.unblock_manager)

router.post("/create-schedule", is_logged_in_post, indexCont.create_general_maint)

router.post('/edit-category', is_logged_in_post, indexCont.edit_category)

router.post('/edit-priority', is_logged_in_post, indexCont.edit_priority)

router.post('/edit-property', is_logged_in_post, indexCont.edit_property)
module.exports = router;
