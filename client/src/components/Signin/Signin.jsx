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

  const [message, setMessage] = useState("");

  const handleSignin = async () => {
    if (email && password) {
      setIsLoading(true);
      setMessage("");
      try {
        const response = (
          await axios.post(getUrl("signin"), { email, password })
        ).data;

        if (response.customMessage) {
          setMessage(response.message);
          setIsLoading(false);
          return;
        }

        setToken(response.token);
        setProfileEmail(response.email);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);

        if (error?.response?.data?.code === "WRONG_PASSWORD") {
          setMessage("Wrong password");
        }
      }
    }
  };

  const handleForgotPassword = async () => {
    if (email) {
      setIsLoading(true);
      setMessage("");
      try {
        const response = (
          await axios.post(getUrl("signin/forgotpassword"), { email })
        ).data;

        if (response.customMessage) {
          setMessage(response.message);
        }

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
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
      {message && <p className="error-message">{message}</p>}
      <div className="sign-in-cta-group">
        <button className="sign-in-submit-button" onClick={handleSignin}>
          Submit
        </button>
        <button
          className="sign-in-forgot-button"
          onClick={handleForgotPassword}
        >
          Fogot password
        </button>
      </div>
    </>
  );
}
