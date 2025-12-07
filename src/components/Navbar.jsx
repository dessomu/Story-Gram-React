import { useNavigate } from "react-router-dom";
import "./compStyles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="nav-bar">
      <h3 className="nav-logo" onClick={() => navigate("/")}>
        StoryGram
      </h3>

      <button className="nav-logout" onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
