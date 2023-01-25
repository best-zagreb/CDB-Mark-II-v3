import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useContext, forwardRef } from "react";

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import {
  CssBaseline,
  Typography,
  Box,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";

import Setup from "./components/pages/Setup";
import Login from "./components/pages/Login";
import NotFound from "./components/pages/NotFound";
import Home from "./components/pages/Home";
import Users from "./components/pages/Users";
import Projects from "./components/pages/Projects";
import Companies from "./components/pages/Companies";
import Company from "./components/pages/Company";

import Header from "./components/Header";

import UserContext from "./context/UserContext";

export default function App() {
  const [appIsSetup, setAppIsSetup] = useState(true);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);

  const [msgModalOpen, setMsgModalOpen] = useState();
  const [popupMessage, setPopupMessage] = useState();

  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();

  async function loginUser(JWToken) {
    const serverResponse = await fetch(
      "http://159.65.127.217:8080/users/login",
      {
        method: "GET",
        headers: {
          googleTokenEncoded: JWToken.credential,
        },
      }
    );

    if (serverResponse.status === 200) {
      handleOpenMsgModal({
        type: "info",
        info: "Login successful.",
        autoHideDuration: 1000,
      });

      const loginInfo = {
        JWT: JWToken,
        lastLogin: new Date(),
        persistentLoginDaysDuration: 7, // change later to be pulled for user settings from database or smth
      };
      localStorage.setItem("loginInfo", JSON.stringify(loginInfo));

      setUser(await serverResponse.json());

      setUserIsLoggedIn(true);
    } else if (serverResponse.status === 404) {
      handleOpenMsgModal({
        type: "error",
        info: "You do not have access to Company Database. If you believe this is a mistake, contact your administrator at email@example.com.",
        autoHideDuration: 5000,
      });
    }
  }

  function handleOpenMsgModal(message) {
    setMsgModalOpen(false);
    setTimeout(() => {
      setPopupMessage(message);
      setMsgModalOpen(true);
    }, 500);
  }

  function handleCloseMsgModal(event, reason) {
    if (reason === "clickaway") {
      return;
    }
    setMsgModalOpen(false);
  }

  useEffect(() => {
    // if (!appIsSetup) {
    //   navigate("/setup");
    // } else
    if (!userIsLoggedIn) {
      const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));

      if (
        loginInfo !== null &&
        (new Date() - Date.parse(Date(loginInfo.lastLogin))) /
          (1000 * 3600 * 24) <
          loginInfo.persistentLoginDaysDuration
      ) {
        // if JWT of user exists in local storage and user has logged in the last X days
        const JWToken = JSON.parse(localStorage.getItem("loginInfo")).JWT;
        loginUser(JWToken);
      } else {
        navigate("/login");
      }
    } else {
      if (location.pathname !== "/login") navigate(location.pathname);
      else navigate("/");
    }
  }, [userIsLoggedIn]);

  return (
    <>
      <CssBaseline enableColorScheme />

      <Routes>
        <Route
          path="/"
          element={
            <Header
              setUserIsLoggedIn={setUserIsLoggedIn}
              handleOpenMsgModal={handleOpenMsgModal}
            />
          }
        >
          <Route index element={<Home />} />

          <Route path="users">
            <Route index element={<Users />} />
          </Route>

          <Route path="projects">
            <Route index element={<Projects />} />
          </Route>

          <Route path="companies" element={<Companies />} />

          <Route path="companies/:id">
            <Route index element={<Company />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="login" element={<Login loginUser={loginUser} />} />
        {/* <Route path="setup" element={<Setup setAppIsSetup={setAppIsSetup} />} /> */}
      </Routes>

      {popupMessage && (
        <Snackbar
          open={msgModalOpen}
          sx={{ maxWidth: "480px" }}
          autoHideDuration={popupMessage.autoHideDuration}
          onClose={handleCloseMsgModal}
        >
          <Alert onClose={handleCloseMsgModal} severity={popupMessage.type}>
            {popupMessage.info}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
