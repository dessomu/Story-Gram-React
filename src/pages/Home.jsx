import StoryUploader from "../components/StoryUploader";
import StoryList from "../components/StoryList";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";
import "./styles/Home.css";

export default function Home() {
  const token = localStorage.getItem("token");
  const user = jwtDecode(token);
  return (
    <div className="home-container">
      <Navbar />

      <div className="home-content">
        <div className="story-actions">
          <StoryUploader userId={user.id} />
        </div>

        <div className="story-list-section">
          <StoryList currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
}
