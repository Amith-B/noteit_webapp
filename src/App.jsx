import { useEffect, useRef, useState } from "react";

import Notes from "./components/Notes/Notes";
import NotesProvider from "./context/notesProvider";

const dummyToken =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwODNkZDU5ODE2NzNmNjYxZmRlOWRhZTY0NmI2ZjAzODBhMDE0NWMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2ODU3ODkyNTIsImF1ZCI6IjY2OTMwNzc2MDM2MC02NjBkMXU3cjQ4c2VubjY0b2p1Y21tcmNvaGJyaTd1My5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNzYzNzI2NDQ1Mzk0NDgzMDQ0NSIsImVtYWlsIjoiYW1pdGhicjZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6IjY2OTMwNzc2MDM2MC02NjBkMXU3cjQ4c2VubjY0b2p1Y21tcmNvaGJyaTd1My5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsIm5hbWUiOiJBbWl0aCBCIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGR1RVdJRmI0aWVHeU5PUnZLVXFpWEtzQVBreWgwbmVFM1drSWJDSEE9czk2LWMiLCJnaXZlbl9uYW1lIjoiQW1pdGgiLCJmYW1pbHlfbmFtZSI6IkIiLCJpYXQiOjE2ODU3ODk1NTIsImV4cCI6MTY4NTc5MzE1MiwianRpIjoiNzg1YTRlY2ExODdkODQ1NDg0MGFmZmZhNjZiNDMwZGU4NWNlNzRhNiJ9.QPBGnSuck1wEQ1jenNnxwcaP2pqbublEJU2oJOUbEdFn_k5PhPJMj5ypcxL5HaQpWvca_F0T9Utxj5GrjV6lJkrfAG3Ws3_PcyN7JfqPWE89LN15n7pncmGIDR4YhGe2dQW9aXcBkzMS3-4ldM3eh2Ga4vMSKJdqpKzlqJYOyR1CiFb5a_4H1KF4NB9lLmaIBE7PVlPP_X5N5UBta2t-3U_8MFOPP6_YngPlujXgxxBHcH_ygSojZozoirNSOmXSsYUeYBioUYObdLHF_wPss2whGsAlmpe6F2op70LYBAQMk4-CmKKd_q2IwmTNgwRr2ArHajF6r5kIV6z0Kj5BKg";

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
