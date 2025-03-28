import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const EmployeeList = ({ employees, setEmployees, setEditingEmployee }) => {
  const { user } = useAuth();

  const handleDelete = async (employeeId) => {
    try {
      await axiosInstance.delete(`/api/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEmployees(employees.filter((employee) => employee._id !== employeeId));
    } catch (error) {
      alert('Failed to delete employee.');
    }
  };

  return (
    <div>
      {employees.map((employee) => (
        <div key={employee._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{employee.name}</h2>
          <p>{employee.email}</p>
          <p>{employee.department}</p>
          <p className="text-sm text-gray-500">Salary: ${employee.salary}</p>
          <div className="mt-2">
            <button
              onClick={() => setEditingEmployee(employee)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(employee._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeList;
