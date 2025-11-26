import { useState } from "react";
import StoryContext from "./StoryContext";

function StoryContextProvider({ children }) {
  const [stories, setStories] = useState([]);
  return (
    <StoryContext.Provider value={{ stories, setStories }}>
      {children}
    </StoryContext.Provider>
  );
}

export default StoryContextProvider;
