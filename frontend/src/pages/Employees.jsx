import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';  // Ensure you have axios instance set up for API requests
import EmployeeForm from '../components/EmployeeForm'; // This is for handling form input (add/update employees)
import EmployeeList from '../components/EmployeeList'; // This is for listing employees
import { useAuth } from '../context/AuthContext';  // Assuming you have authentication context

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);  // To track loading state
  const [error, setError] = useState(null);  // To store error messages if API call fails

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get('/api/employees', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEmployees(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch employees.');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user]);  // Fetch employees when the component is mounted or user changes

  return (
    <div className="container mx-auto p-6">
      {loading && <p>Loading employees...</p>}
      {error && <p>{error}</p>}
      
      <EmployeeForm
        employees={employees}
        setEmployees={setEmployees}
        editingEmployee={editingEmployee}
        setEditingEmployee={setEditingEmployee}
      />
      <EmployeeList
        employees={employees}
        setEmployees={setEmployees}
        setEditingEmployee={setEditingEmployee}
      />
    </div>
  );
};

export default Employees;
