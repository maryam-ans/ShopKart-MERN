import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../axios/axiosCalls";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/useAuth";
import "./Home.css";

function Home() {
  const { customer, setCustomer } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");

    try {
      await axiosInstance.post("/customers/logout");
      setCustomer(null);
      navigate("/login", { replace: true });
    } catch {
      setError("Unable to log out. Please try again.");
    }
  };

  return (
    <div className="home-page">

      <Navbar onLogout={handleLogout} />

      {/* Main Card */}
      <main className="home-container">

        {/* Welcome Section */}
        <section className="welcome-section">
          <h1>
            Welcome back, {customer?.fullName}! 👋
          </h1>

          <p>
            We're glad to see you at ShopKart.
          </p>
        </section>

        {/* Profile Section */}
        <section className="profile-section">
          <h2>Profile Details</h2>

          <div className="profile-grid">

            {/* Full Name */}
            <div className="profile-box">
              <span className="profile-label">Full Name</span>
              <strong>{customer?.fullName}</strong>
            </div>

            {/* Email */}
            <div className="profile-box">
              <span className="profile-label">Email Address</span>
              <strong>{customer?.email}</strong>
            </div>

            {/* Phone */}
            <div className="profile-box">
              <span className="profile-label">Phone Number</span>
              <strong>{customer?.phone}</strong>
            </div>

            {/* Account Status */}
            <div className="profile-box">
              <span className="profile-label">Account Status</span>

              <strong className="active-status">
                <span className="status-dot"></span>
                Active
              </strong>
            </div>

          </div>
        </section>

        {/* Error */}
        {error && (
          <p className="logout-error" role="alert">
            {error}
          </p>
        )}

      </main>
    </div>
  );
}

export default Home;