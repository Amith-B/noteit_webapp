import "./Signin.scss";

import React, { useContext, useState } from "react";

import NotesContext from "../../context/notesContext";
import axios from "axios";
import { getUrl } from "../../utils/api";

export default function Signin() {
  const {
    setToken,
    setEmail: setProfileEmail,
    setIsLoading,
  } = useContext(NotesContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const handleSignin = async () => {
    if (email && password) {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = (
          await axios.post(getUrl("signin"), { email, password })
        ).data;

        setToken(response.token);
        setProfileEmail(response.email);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);

        if (error?.response?.data?.code === "WRONG_PASSWORD") {
          setErrorMessage("Wrong password");
        }
      }
    }
  };

  return (
    <>
      <h4>Signin/Signup</h4>
      <section className="sign-in-input-group">
        <input
          type="email"
          id="email"
          placeholder="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSignin()}
        />
        <input
          type="password"
          id="password"
          placeholder="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSignin()}
        />
      </section>
      <p className="sign-in-note">
        <b>Note:</b> If given email is not registered, then that email will be
        created with the given password
      </p>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <button className="sign-in-submit-button" onClick={handleSignin}>
        Submit
      </button>
    </>
  );
}
