import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.nav}>
      <h3 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        Stories
      </h3>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

const styles = {
  nav: {
    padding: 15,
    background: "#eee",
    display: "flex",
    justifyContent: "space-between",
  },
};
