import React from "react";
import swal from "sweetalert";
import { Link } from "react-router-dom";

import axios from "../utils/axiosurl";
export default function Register() {
  const registerUser = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const password2 = e.target.password2.value;
    const regObj = {
      name,
      email,
      password,
      password2,
    };
    await axios
      .post("/register", regObj)
      .then((res) => {
        if (res.data === "Registration Successful") {
          swal(res.data, "Continue to login", "success").then((clicked) => {
            if (clicked) {
              window.location.href = "/login";
            }
          });
        } else if (res.data === "User exists") {
          swal(res.data, "Try logging in", "warning");
        } else {
          swal(res.data, "An error occurred", "warning");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <section className="auth">
      <h1 className="title">Register</h1>
      <p className="sub-title">Create an account to start sharing!</p>
      <form className="auth-form" onSubmit={(e) => registerUser(e)}>
        <input type="text" placeholder="name" name="name" />

        <input type="email" placeholder="email" name="email" />

        <input type="password" placeholder="password" name="password" />
        <input type="password" placeholder="verify password" name="password2" />

        <button className="primary-btn" type="submit">
          Submit
        </button>
      </form>
      <p className="sub-title">
        Already have an account ?{" "}
        <Link to="/login" className="text-blue">
          Login here
        </Link>{" "}
      </p>
    </section>
  );
}
