import { useNavigate } from "react-router-dom";
import "./compStyles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h3 className="navbar-title" onClick={() => navigate("/")}>
        StoryGram
      </h3>

      <button className="navbar-logout-btn" onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
