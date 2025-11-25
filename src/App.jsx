import StoryUploader from "./components/StoryUploader";
import StoryList from "./components/StoryList";

function App() {
  const userId = "673fd72f16a55e410f0e4d88"; // Example userId

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>📸 Story Upload Demo</h1>
      <StoryUploader userId={userId} />
      <StoryList />
    </div>
  );
}

export default App;
