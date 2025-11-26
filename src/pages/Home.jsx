import StoryUploader from "../components/StoryUploader";
import StoryList from "../components/StoryList";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";

export default function Home() {
  const token = localStorage.getItem("token");
  const user = jwtDecode(token);
  return (
    <div>
      <Navbar />
      <h2 style={{ textAlign: "center" }}>Welcome to Story App</h2>
      <StoryUploader userId={user.id} />
      <StoryList currentUserId={user.id} />
    </div>
  );
}
