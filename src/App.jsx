import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import OtpManagement from './pages/OtpManagement'
import BlogManagement from './pages/BlogManagement'
import CategoryManagement from './pages/CategoryManagement'
import EmailManagement from './pages/EmailManagement'
import MessageManagement from './pages/MessageManagement'
import './App.css'

function App() {
  return (
    <Router basename="/projectblogs-admin">
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/otp-management" replace />} />
          <Route path="/otp-management" element={<OtpManagement />} />
          <Route path="/blog-management" element={<BlogManagement />} />
          <Route path="/category-management" element={<CategoryManagement />} />
          <Route path="/email-management" element={<EmailManagement />} />
          <Route path="/message-management" element={<MessageManagement />} />
          {/* Add more routes here as needed */}
          <Route path="*" element={
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h2 className="gradient-text">Page coming soon...</h2>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

