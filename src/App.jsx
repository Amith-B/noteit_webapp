import Notes from "./components/Notes/Notes";
import NotesContext from "./context/notesContext";
import Signin from "./components/Signin/Signin";
import { useContext } from "react";

function App() {
  const { token } = useContext(NotesContext);

  return (
    <div className="App">
      {token ? (
        <Notes />
      ) : (
        <div className="sign-in-container">
          <div className="sign-in-card">
            <Signin />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
