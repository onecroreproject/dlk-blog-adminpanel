import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Settings, LogOut, Mail, MessageSquare } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <ShieldCheck size={24} color="#6366f1" />
          </div>
          <span className="logo-text">AdminPanel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/otp-management" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ShieldCheck size={20} />
          <span>Otp management</span>
        </NavLink>

        <NavLink 
          to="/blog-management" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Blog Management</span>
        </NavLink>

        <NavLink 
          to="/category-management" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span>Category Management</span>
        </NavLink>

        <NavLink 
          to="/email-management" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Mail size={20} />
          <span>Email Management</span>
        </NavLink>

        <NavLink 
          to="/message-management" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <MessageSquare size={20} />
          <span>User Messages</span>
        </NavLink>
        
       
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
