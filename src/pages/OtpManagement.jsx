import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, RefreshCcw, Clock, Lock } from 'lucide-react';
import './OtpManagement.css';

const API_URL = `${import.meta.env.VITE_API_URL}/otp`;

const OtpManagement = () => {
  const [otpData, setOtpData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLatestOtp();
  }, []);

  const fetchLatestOtp = async () => {
    try {
      const res = await axios.get(`${API_URL}/latest`);
      setOtpData(res.data);
    } catch (err) {
      if (err.response && err.response.status === 410) {
        console.log("OTP expired");
      } else if (err.response && err.response.status === 404) {
        console.log("No OTP exists yet");
      } else {
        console.error('Error fetching OTP:', err);
      }
      setOtpData(null);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/generate`);
      setOtpData(res.data.otp);
    } catch (err) {
      console.error('Error generating OTP:', err);
      alert('Failed to generate OTP');
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
          {otpData 
            ? "Your secure code for today's student access." 
            : "Generate a secure 4-digit code for daily student access."}
        </p>

        {!otpData && (
          <button 
            className="generate-btn" 
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCcw size={20} className="animate-spin" />
            ) : (
              <Lock size={20} />
            )}
            Generate Passcode
          </button>
        )}

        {otpData && (
          <div className="otp-display-wrapper">
            <div className="otp-code-box">
              <span className="otp-code">{otpData.code}</span>
            </div>
            
            <div className="validity-badge">
              <Clock size={14} />
              Valid Until Midnight
            </div>
            
            <span className="expiry-text">
              Expires at 11:59 PM today
            </span>
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
      `}</style>
    </div>
  );
};

export default OtpManagement;
