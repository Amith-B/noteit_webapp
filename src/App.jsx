import { useContext, useEffect, useRef } from "react";

import Notes from "./components/Notes/Notes";
import NotesContext from "./context/notesContext";
import axios from "axios";
import { getUrl } from "./utils/api";

function App() {
  const signInButton = useRef(null);
  const { setToken, token, setProfile } = useContext(NotesContext);

  const handleSignin = async (response) => {
    const signInResponse = (
      await axios.get(getUrl("signin"), {
        headers: {
          Authorization: `Bearer ${response.credential}`,
        },
      })
    ).data;

    const { token, email, name, picture } = signInResponse;

    setToken(token);
    setProfile({
      email,
      name,
      picture,
    });
  };

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleSignin,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    /* global google */
    if (signInButton.current && google) {
      google.accounts.id.renderButton(signInButton.current, {
        theme: "outline",
        size: "large",
      });
    }
  }, [signInButton, token]);

  return (
    <div className="App">
      {token ? (
        <Notes />
      ) : (
        <div className="sign-in-container">
          <div className="sign-in-card">
            <div className="sign-in-text">Sign up/Sign in</div>
            <div className="sign-in" ref={signInButton}></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
