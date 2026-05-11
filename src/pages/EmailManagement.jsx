import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Search, Trash2, Users, Plus } from 'lucide-react';
import './BlogManagement.css';

const EmailManagement = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/newsletter`);
      setSubscribers(res.data);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this subscriber?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/newsletter/${id}`);
        setSubscribers(subscribers.filter(s => s._id !== id));
      } catch (err) {
        console.error("Error deleting subscriber:", err);
      }
    }
  };

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="blog-management email-management">
      <div className="page-header">
        <h1 style={{ color: 'black' }}>Email Management</h1>
        <div className="flex gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-100 flex items-center gap-3 w-64 shadow-sm">
            <Search className="text-gray-300" size={18} />
            <input
              type="text"
              placeholder="Search subscribers..."
              className="outline-none bg-transparent w-full text-black font-bold text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>
      </div>

      <div className="blog-table-container">
        <table className="blog-table">
          <thead>
            <tr>
              <th style={{ color: 'black' }}>Subscriber Details</th>
              <th style={{ color: 'black' }}>Subscribed Date</th>
              <th style={{ color: 'black' }}>Status</th>
              <th style={{ color: 'black' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'black', fontWeight: 800 }}>Loading Records...</td></tr>
            ) : filteredSubscribers.length > 0 ? (
              filteredSubscribers.map((sub) => (
                <tr key={sub._id}>
                  <td>
                    <div className="blog-title-cell">
                      <div className="blog-thumb flex items-center justify-center bg-black text-white">
                        <Mail size={16} />
                      </div>
                      <span style={{ color: 'black', fontWeight: 700 }}>{sub.email}</span>
                    </div>
                  </td>
                  <td style={{ color: 'black', fontWeight: 600 }}>
                    {new Date(sub.subscribedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase  border border-green-100">
                      Active
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="action-btn delete-btn" onClick={() => handleDelete(sub._id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'black', fontWeight: 800 }}>No Subscribers Found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats Summary */}
      <div className="mt-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm inline-flex items-center gap-6 min-w-[280px]">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase  mb-1">Total Audience</p>
            <h3 className="text-3xl font-black text-black leading-none">{subscribers.length}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailManagement;
