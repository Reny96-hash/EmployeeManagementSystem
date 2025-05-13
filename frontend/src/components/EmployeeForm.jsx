import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const EmployeeForm = ({ employees, setEmployees, editingEmployee, setEditingEmployee }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    salary: ''
  });
  const [error, setError] = useState(null);

  // If we're editing an employee, fill the form with their data
  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        name: editingEmployee.name,
        email: editingEmployee.email,
        department: editingEmployee.department,
        salary: editingEmployee.salary
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: '',
        salary: ''
      });
    }
  }, [editingEmployee]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state before submitting

    try {
      if (editingEmployee) {
        // Update the existing employee
        const response = await axiosInstance.put(`/api/employees/${editingEmployee._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setEmployees(employees.map((employee) => (employee._id === response.data._id ? response.data : employee)));
      } else {
        // Create a new employee
        const response = await axiosInstance.post('/api/employees', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setEmployees([...employees, response.data]);
      }

      setEditingEmployee(null); // Reset editing state
      setFormData({ name: '', email: '', department: '', salary: '' }); // Reset form
    } catch (error) {
      console.error('Error saving employee:', error.response || error.message);
      setError(error.response ? error.response.data.message : 'Failed to save employee.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">
        {editingEmployee ? 'Edit Employee' : 'Create Employee'}
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>} {/* Display error message if it exists */}

      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Department"
        value={formData.department}
        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        required
      />

      <input
        type="number"
        placeholder="Salary"
        value={formData.salary}
        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        required
      />

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingEmployee ? 'Update Employee' : 'Create Employee'}
      </button>
    </form>
  );
};

export default EmployeeForm;
