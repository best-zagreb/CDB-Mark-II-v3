import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import CssBaseline from "@mui/material/CssBaseline";

import Setup from "./components/pages/Setup";
import Login from "./components/pages/Login";
import NotFound from "./components/pages/NotFound";
import Home from "./components/pages/Home";
import Users from "./components/pages/Users";
import Projects from "./components/pages/Projects";
import Companies from "./components/pages/Companies";
import Company from "./components/pages/Company";

import Header from "./components/Header";

export default function App() {
  const [appIsSetup, setAppIsSetup] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // if (!appIsSetup) {
    //   navigate("/setup");
    // } else
    if (!isLoggedIn) {
      const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));

      if (
        loginInfo !== null &&
        (new Date() - Date.parse(Date(loginInfo.lastLogin))) /
          (1000 * 3600 * 24) <
          loginInfo.persistentLoginDaysDuration &&
        checkIfUserInDatabase(loginInfo.user)
      ) {
        // if JWT of user exists in local storage, user has logged in the last X days and that user is in database
        setIsLoggedIn(true);
      } else {
        navigate("/login");
      }
    } else {
      navigate("/");
    }
  }, [appIsSetup, isLoggedIn]);

  async function checkIfUserInDatabase(userObject) {
    return false;
    await fetch(
      "http://159.65.127.217:8080/users/get-user?email=" + userObject.email,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + window.btoa("admin:pass"),
        },
      }
    )
      .then((response) => response.json())
      .then((json) => {
        if (json.length > 0) {
          return true;
        } else {
          return false;
        }
      });
  }

  return (
    <>
      <CssBaseline enableColorScheme />

      <Routes>
        <Route path="/" element={<Header setIsLoggedIn={setIsLoggedIn} />}>
          <Route index element={<Home />} />

          <Route path="users">
            <Route index element={<Users />} />
          </Route>

          <Route path="projects">
            <Route index element={<Projects />} />
          </Route>

          <Route path="companies">
            <Route index element={<Companies />} />
          </Route>

          <Route path="companies/:id">
            <Route index element={<Company />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="login"
          element={
            <Login
              setIsLoggedIn={setIsLoggedIn}
              checkIfUserInDatabase={checkIfUserInDatabase}
            />
          }
        />
        {/* <Route path="setup" element={<Setup setAppIsSetup={setAppIsSetup} />} /> */}
      </Routes>
    </>
  );
}
