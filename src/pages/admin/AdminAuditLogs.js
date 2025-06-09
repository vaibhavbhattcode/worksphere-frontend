import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import axios from "../../api/api";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("/admin/audit-logs");
        setLogs(response.data);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      }
    };

    fetchLogs();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Action</th>
            <th className="py-2 px-4 border-b">Performed By</th>
            <th className="py-2 px-4 border-b">Timestamp</th>
            <th className="py-2 px-4 border-b">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td className="py-2 px-4 border-b">{log.action}</td>
              <td className="py-2 px-4 border-b">{log.performedBy.email}</td>
              <td className="py-2 px-4 border-b">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="py-2 px-4 border-b">
                {JSON.stringify(log.details)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
