import "./Signin.scss";

import React, { useContext, useState } from "react";

import NotesContext from "../../context/notesContext";
import axios from "axios";
import { getUrl } from "../../utils/api";

export default function Signin() {
  const { setToken, setEmail: setProfileEmail } = useContext(NotesContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignin = async () => {
    const response = (await axios.post(getUrl("signin"), { email, password }))
      .data;

    setToken(response.token);
    setProfileEmail(response.email);
  };

  return (
    <>
      <h4>Signin/Signup</h4>
      <section className="sign-in-input-group">
        <input
          type="email"
          id="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          id="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </section>
      <button className="sign-in-submit-button" onClick={handleSignin}>
        Submit
      </button>
    </>
  );
}
