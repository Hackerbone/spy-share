import React from "react";
import { Link } from "react-router-dom";
export default function NoPage() {
  return (
    <section className="homepage">
      <h1 className="error-heading text-blue">404</h1>
      <h1>Page not found</h1>

      <p className="sub-title my-1">My bad I forgot to make this page. Or did I ?</p>

      <Link to="/" className="primary-btn">
        Back to home
      </Link>
    </section>
  );
}
