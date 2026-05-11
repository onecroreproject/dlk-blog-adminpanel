import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEnvelope, FaUser, FaClock, FaCheckCircle, FaRegEnvelopeOpen } from 'react-icons/fa';

const MessageManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/messages/${id}`);
        setMessages(messages.filter(m => m._id !== id));
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'new' ? 'read' : 'new';
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/messages/${id}/status`, { status: newStatus });
      setMessages(messages.map(m => m._id === id ? { ...m, status: newStatus } : m));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">User Messages</h1>
          <p className="text-gray-400 font-bold uppercase  text-[10px] mt-1">Manage user inquiries and feedback</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-gray-400 font-black text-xs uppercase  mr-2">Total Inquiries:</span>
          <span className="text-red-600 font-black text-lg">{messages.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`bg-white rounded-[30px] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-xl relative overflow-hidden group ${msg.status === 'new' ? 'border-l-8 border-l-red-600' : 'border-l-8 border-l-gray-200'}`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

                <div className="flex-grow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 font-black text-xl">
                      {msg.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        {msg.name}
                        {msg.status === 'new' && (
                          <span className="bg-red-600 text-white text-[8px] px-2 py-1 rounded-full uppercase  animate-pulse">New</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase  mt-1">
                        <span className="flex items-center gap-1"><FaEnvelope className="text-red-600" /> {msg.email}</span>
                        <span className="flex items-center gap-1"><FaClock className="text-red-600" /> {new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 text-gray-600 font-medium leading-relaxed text-sm italic border border-gray-100">
                    "{msg.content}"
                  </div>
                </div>

                <div className="flex md:flex-col gap-3 shrink-0">
                  <button
                    onClick={() => toggleStatus(msg._id, msg.status)}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase  transition-all ${msg.status === 'new' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                  >
                    {msg.status === 'new' ? <><FaCheckCircle /> Mark as Read</> : <><FaRegEnvelopeOpen /> Mark Unread</>}
                  </button>
                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase "
                  >
                    <FaTrash /> Delete
                  </button>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[10px] p-20 border-2 border-dashed border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto mb-6">
              <FaRegEnvelopeOpen size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-300 uppercase ">No Messages Yet</h2>
            <p className="text-gray-400 font-bold mt-2">When users contact you, their messages will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageManagement;
