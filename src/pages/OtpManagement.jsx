import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, RefreshCcw, Clock, Lock } from 'lucide-react';
import './OtpManagement.css';

const API_URL = `${import.meta.env.VITE_API_URL}/otp`;

const OtpManagement = () => {
  const [otpData, setOtpData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    fetchLatestOtp();
  }, []);

  useEffect(() => {
    if (!otpData) return;

    const updateTimer = () => {
      const now = new Date();
      const expiry = new Date(otpData.expiresAt);
      const diff = expiry - now;

      if (diff <= 0) {
        fetchLatestOtp();
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [otpData]);

  const fetchLatestOtp = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/latest`);
      setOtpData(res.data);
    } catch (err) {
      console.error('Error fetching OTP:', err);
      setOtpData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="otp-management-container">
      <div className="otp-card">
        <div className="otp-icon-wrapper">
          <ShieldCheck size={40} />
        </div>
        
        <h1 className="otp-title">Daily Passcode</h1>
        <p className="otp-subtitle">
          Your secure code for today's student access.
        </p>

        {isLoading && !otpData ? (
          <div className="otp-loading">
            <RefreshCcw size={32} className="animate-spin text-green-500" />
            <p>Loading today's code...</p>
          </div>
        ) : otpData ? (
          <div className="otp-display-wrapper">
            <div className="otp-code-box">
              <span className="otp-code">{otpData.code}</span>
            </div>
            
            <div className="validity-badge">
              <Clock size={16} />
              <span>Time Until Expiration</span>
            </div>
            
            <div className="countdown-timer">
              {timeLeft}
            </div>

            <span className="expiry-text">
              New code will be generated at midnight
            </span>
          </div>
        ) : (
          <div className="error-message">
            <p>Failed to load passcode. Please refresh.</p>
            <button onClick={fetchLatestOtp} className="refresh-btn">
              <RefreshCcw size={16} /> Retry
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .otp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          color: #64748b;
          font-weight: 500;
        }
        .countdown-timer {
          font-size: 2rem;
          font-weight: 800;
          color: #ef4444;
          margin: 1rem 0;
          font-family: monospace;
          background: #fef2f2;
          padding: 0.5rem 1.5rem;
          border-radius: 12px;
          border: 1px solid #fee2e2;
        }
        .error-message {
          color: #ef4444;
          text-align: center;
          padding: 2rem;
        }
        .refresh-btn {
          margin-top: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #22c55e;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .refresh-btn:hover {
          background: #16a34a;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default OtpManagement;
