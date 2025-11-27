import StoryUploader from "../components/StoryUploader";
import StoryList from "../components/StoryList";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";
import "./styles/Home.css";

export default function Home() {
  const token = localStorage.getItem("token");
  const user = jwtDecode(token);
  return (
    <div className="home-wrapper">
      <Navbar />

      <div className="home-content">
        {/* <h2 className="home-title">Welcome to Story App</h2> */}

        <StoryUploader userId={user.id} />
        <StoryList currentUserId={user.id} />
      </div>
    </div>
  );
}
