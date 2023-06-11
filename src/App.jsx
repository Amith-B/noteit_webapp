import Notes from "./components/Notes/Notes";
import NotesContext from "./context/notesContext";
import Signin from "./components/Signin/Signin";
import { useContext } from "react";

function App() {
  const { token, isLoading } = useContext(NotesContext);

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
      {isLoading && (
        <div className="lds-loading-overlay">
          <div className="lds-loading">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
