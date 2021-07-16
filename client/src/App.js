import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "./utils/axiosurl";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notes from "./pages/Notes";
import Note from "./pages/Note";
import NoPage from "./pages/NoPage";

import "./App.scss";

function App() {
  const [user, setUser] = useState({});

  useEffect(() => {
    axios.get("/user").then((res) => {
      setUser(res.data);
    });
  }, []);

  return (
    <>
      <Router>
        {user ? (
          <Switch>
            <Route path="/notes" exact>
              <Notes user={user} />
            </Route>
            <Route path="/note/:noteID" exact>
              <Note user={user} />
            </Route>
            <Route path="/" exact>
              <Notes user={user} />
            </Route>
            <Route path="*">
              <NoPage />
            </Route>
          </Switch>
        ) : (
          <Switch>
            <Route path="/login" exact>
              <Login />
            </Route>
            <Route path="/register" exact>
              <Register />
            </Route>
            <Route path="/" exact>
              <Home />
            </Route>

            <Route path="*">
              <NoPage />
            </Route>
          </Switch>
        )}
      </Router>
    </>
  );
}

export default App;
