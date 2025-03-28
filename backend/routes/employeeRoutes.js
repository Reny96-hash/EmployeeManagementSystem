const express = require('express');
const { getEmployees, addEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this middleware checks for authentication
const router = express.Router();

// Route to get all employees and add a new employee
router.route('/').get(protect, getEmployees).post(protect, addEmployee);

// Route to update and delete an employee by ID
router.route('/:id').put(protect, updateEmployee).delete(protect, deleteEmployee);

module.exports = router;
