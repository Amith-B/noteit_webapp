import { useEffect, useRef, useState } from "react";

import Notes from "./components/Notes/Notes";
import NotesProvider from "./context/notesProvider";

const dummyToken =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjJkOWE1ZWY1YjEyNjIzYzkxNjcxYTcwOTNjYjMyMzMzM2NkMDdkMDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2ODUyODk4NzksImF1ZCI6IjY2OTMwNzc2MDM2MC02NjBkMXU3cjQ4c2VubjY0b2p1Y21tcmNvaGJyaTd1My5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNzYzNzI2NDQ1Mzk0NDgzMDQ0NSIsImVtYWlsIjoiYW1pdGhicjZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6IjY2OTMwNzc2MDM2MC02NjBkMXU3cjQ4c2VubjY0b2p1Y21tcmNvaGJyaTd1My5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsIm5hbWUiOiJBbWl0aCBCIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGR1RVdJRmI0aWVHeU5PUnZLVXFpWEtzQVBreWgwbmVFM1drSWJDSEE9czk2LWMiLCJnaXZlbl9uYW1lIjoiQW1pdGgiLCJmYW1pbHlfbmFtZSI6IkIiLCJpYXQiOjE2ODUyOTAxNzksImV4cCI6MTY4NTI5Mzc3OSwianRpIjoiYTA5ZjUxNzEyZTliYzQxY2Y2YmRiOTFmNzJkMTA5YWIyOTZjYWZmMiJ9.IEVX_EXRJIoarLTHCXY6kORhDVTSTbx26QGdyTMXgihmlrJ7fmdxOZ9cbBf5XFEKckN0NDgmToZdNgp1-X6vzx6I_Hul8DMmOJlAl0oW_06dV3DxGJKnMdeSYXHp9qr6qDfvyL2vcnLN98YptraQAdldvkLpVCg-r4O5-kwqzduky5ctjOjyjwOm8n_0Auy_tk43RHQzQM_gLDuDjbYQ8n5RVHlETSsV_YQoJ_PCuGE4KGNdysXs-JMOdWYw8cmmglI8gqfgGVbtUKWeMsCmLWMMWa2zcqX5uc4-JndOf8yhYPltnWN23UxkxeGKV6cfJz7ehR9rXE1DtMh4P2BXWw";

function App() {
  const [user, setUser] = useState(null);
  const signInButton = useRef(null);

  const handleSignin = (response) => {
    setTimeout(() => {
      // console.log(response.credential);
      // document.cookie = `google_jwt=${response.credential}`;
      fetch("http://localhost:3001/api/signin", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${response.credential}`,
        },
      }).then((response) => {
        fetch("http://localhost:3001/api/notes", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${response.credential}`,
          },
        });
      });
    }, 1000);
  };

  useEffect(() => {
    google.accounts.id.initialize({
      client_id:
        "669307760360-660d1u7r48senn64ojucmmrcohbri7u3.apps.googleusercontent.com",
      callback: handleSignin,
    });

    handleSignin({ credential: dummyToken });
  }, []);

  useEffect(() => {
    /* global google */
    if (signInButton.current) {
      google.accounts.id.renderButton(signInButton.current, {
        theme: "outline",
        size: "large",
      });
    }
  }, [signInButton]);
  return (
    <div className="App">
      <NotesProvider>
        {user ? <Notes /> : <div className="sign-in" ref={signInButton}></div>}
      </NotesProvider>
    </div>
  );
}

export default App;
