import React from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axiosurl";
import swal from "sweetalert";

export default function Login() {
  const loginUser = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email || !password) {
      swal("Email or Password cannot be empty", "Please fill in the details to Login", "warning");
    } else {
      const loginObj = {
        email,
        password,
      };

      axios
        .post("/user/login", loginObj)
        .then((res) => {
          if (res.data === "Authentication successful") {
            swal(res.data, "Continue to your notes", "success").then((clicked) => {
              if (clicked) {
                window.location.href = "/notes";
              }
            });
          } else {
            swal(res.data, "Please check your credentials", "warning");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <section className="auth">
      <h1 className="title">Login</h1>
      <p className="sub-title">Log in to your account to access your notes</p>

      <form onSubmit={(e) => loginUser(e)} className="auth-form">
        <input type="email" placeholder="email" name="email" />
        <input type="password" placeholder="password" name="password" />

        <button className="primary-btn" type="submit">
          Submit
        </button>
      </form>

      <p className="sub-title">
        Don't have an account ?{" "}
        <Link to="/register" className="text-blue">
          Register here
        </Link>{" "}
      </p>
    </section>
  );
}
