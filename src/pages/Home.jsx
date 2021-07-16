import React from "react";
import { useHistory } from "react-router-dom";

export default function Home() {
  const history = useHistory();
  return (
    <section className="homepage">
      <h1 className="title">Spy Share</h1>
      <p className="sub-title">Stick and save your notes and access them from anywhere!</p>
      <button className="primary-btn" onClick={() => history.push("/login")}>
        Get Started
      </button>
    </section>
  );
}
