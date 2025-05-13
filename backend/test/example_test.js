const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const sinon = require('sinon');
const { expect } = chai;
const app = require('../server'); 
const Employee = require('../models/employee');
const { addEmployee, updateEmployee, deleteEmployee, getEmployees } = require('../controllers/employeeController');

chai.use(chaiHttp);

describe('Employee Management System', () => {
  let createStub, findByIdStub, findStub, removeStub;
  
  // Test Add Employee
  describe('AddEmployee Function Test', function() {
    this.timeout(10000);  // Increase timeout for async operations
  
    let createStub;
  
    beforeEach(() => {
      createStub = sinon.stub(Employee, 'create');  // Stub before each test
    });
  
    afterEach(() => {
      createStub.restore();  // Restore after each test to prevent wrapping issues
    });
  
    it('should create a new employee successfully', (done) => {
      // Mock request data
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { name: "John Doe", email: "john@example.com", department: "Sales", salary: 50000 }
      };
  
      // Mock employee that would be created
      const createdEmployee = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };
  
      // Stub employee.create to return the createdEmployee
      createStub.resolves(createdEmployee);
  
      // Mock response object
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
  
      // Call function
      addEmployee(req, res).then(() => {
        // Assertions
        expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith(createdEmployee)).to.be.true;
        done(); // Make sure to call done() when the test finishes
      }).catch(done); // If an error occurs, pass it to done
    });
  
    it('should return 500 if an error occurs', (done) => {
      // Stub Employee.create to throw an error
      createStub.rejects(new Error('DB Error'));
  
      // Mock request data
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { name: "John Doe", email: "john@example.com", department: "Sales", salary: 50000 }
      };
  
      // Mock response object
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
  
      // Call function
      addEmployee(req, res).then(() => {
        // Assertions
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
        done(); // Make sure to call done()
      }).catch(done); // If an error occurs, pass it to done
    });
  });
  
  

  // Test Update Employee
  describe('Update Employee Test', () => {
    it('should update employee successfully', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const existingEmployee = {
        _id: employeeId,
        name: "John Doe",
        email: "john@example.com",
        department: "Sales",
        salary: 50000,
        save: sinon.stub().resolvesThis()
      };

      findByIdStub = sinon.stub(Employee, 'findById').resolves(existingEmployee);

      const req = {
        params: { id: employeeId },
        body: { name: "Jane Doe", department: "Marketing", salary: 60000 }
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await updateEmployee(req, res);

      expect(existingEmployee.name).to.equal("Jane Doe");
      expect(existingEmployee.department).to.equal("Marketing");
      expect(existingEmployee.salary).to.equal(60000);
      expect(res.status.called).to.be.false;
      expect(res.json.calledOnce).to.be.true;

      findByIdStub.restore();
    });

    it('should return 404 if employee not found', async () => {
      findByIdStub = sinon.stub(Employee, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await updateEmployee(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Employee not found' })).to.be.true;

      findByIdStub.restore();
    });

    it('should return 500 if an error occurs during update', async () => {
      findByIdStub = sinon.stub(Employee, 'findById').throws(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await updateEmployee(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.called).to.be.true;

      findByIdStub.restore();
    });
  });

  // Test Get Employees
  describe('Get Employees Test', () => {
    it('should return all employees successfully', async () => {
      const employees = [
        { _id: new mongoose.Types.ObjectId(), name: "John Doe", email: "john@example.com", department: "Sales", salary: 50000 },
        { _id: new mongoose.Types.ObjectId(), name: "Jane Doe", email: "jane@example.com", department: "Marketing", salary: 60000 }
      ];

      findStub = sinon.stub(Employee, 'find').resolves(employees);

      const req = {};
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis()
      };

      await getEmployees(req, res);

      expect(findStub.calledOnce).to.be.true;
      expect(res.json.calledWith(employees)).to.be.true;
      expect(res.status.called).to.be.false;

      findStub.restore();
    });

    it('should return 500 on error', async () => {
      findStub = sinon.stub(Employee, 'find').throws(new Error('DB Error'));

      const req = {};
      const res = {
        json: sinon.spy(),
        status: sinon.stub().returnsThis()
      };

      await getEmployees(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

      findStub.restore();
    });
  });

  // Test Delete Employee
  describe('Delete Employee Test', () => {
    it('should delete employee successfully', async () => {
      const employeeId = new mongoose.Types.ObjectId();
      const employee = { remove: sinon.stub().resolves() };

      findByIdStub = sinon.stub(Employee, 'findById').resolves(employee);

      const req = { params: { id: employeeId.toString() } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await deleteEmployee(req, res);

      expect(findByIdStub.calledOnceWith(employeeId.toString())).to.be.true;
      expect(employee.remove.calledOnce).to.be.true;
      expect(res.json.calledWith({ message: 'Employee deleted' })).to.be.true;

      findByIdStub.restore();
    });

    it('should return 404 if employee not found', async () => {
      findByIdStub = sinon.stub(Employee, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await deleteEmployee(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Employee not found' })).to.be.true;

      findByIdStub.restore();
    });

    it('should return 500 if an error occurs during deletion', async () => {
      findByIdStub = sinon.stub(Employee, 'findById').throws(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      await deleteEmployee(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

      findByIdStub.restore();
    });
  });
});
