import StoryUploader from "../components/StoryUploader";
import StoryList from "../components/StoryList";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <h2 style={{ textAlign: "center" }}>Welcome to Story App</h2>
      <StoryUploader />
      <StoryList />
    </div>
  );
}
