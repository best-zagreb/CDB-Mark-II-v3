import {
  Container,
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { AddCircle as AddCircleIcon } from "@mui/icons-material";

import { useState, useEffect, useContext } from "react";

import ToastContext from "../../context/ToastContext";
import DeleteAlertContext from "../../context/DeleteAlertContext";

import UserForm from "../forms/UserForm";

import SearchBar from "./partial/SearchBar";
import TableComponent from "./partial/TableComponent";

const tableColumns = [
  { key: "firstName", label: "Name" },
  { key: "lastName", label: "Surname" },
  { key: "nickname", label: "Nickname", xsHide: true },
  { key: "loginEmail", label: "E-mail", xsHide: true },
  { key: "authority", label: "Max authorization level", xsHide: true },
];

export default function Users() {
  const { handleOpenToast } = useContext(ToastContext);
  const { setOpenDeleteAlert, setObject, setEndpoint, setPopulateObjects } =
    useContext(DeleteAlertContext);

  const [openFormModal, setOpenFormModal] = useState(false);
  const [user, setUser] = useState();

  const [data, setData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(true);

  async function populateTable() {
    setLoading(true);

    const JWToken = JSON.parse(localStorage.getItem("loginInfo")).JWT;

    try {
      const serverResponse = await fetch("http://localhost:8080/users/", {
        method: "GET",
        headers: { googleTokenEncoded: JWToken.credential },
      });

      if (serverResponse.ok) {
        const json = await serverResponse.json();

        setData(json);
        setSearchResults(json);
      } else {
        handleOpenToast({
          type: "error",
          info: "A server error occurred whilst fetching data.",
        });
      }
    } catch (error) {
      handleOpenToast({
        type: "error",
        info: "An error occurred whilst trying to connect to server.",
      });
    }

    setLoading(false);
  }

  function handleEdit(user) {
    setUser(user);
    setOpenFormModal(true);
  }

  function handleDelete(user) {
    setObject({ type: "User", name: user.firstName + " " + user.lastName });
    setEndpoint("http://localhost:8080/users/" + user.id);
    setPopulateObjects({ function: populateTable });

    setOpenDeleteAlert(true);
  }

  useEffect(() => {
    populateTable();
  }, []);

  return (
    <>
      <UserForm
        user={user}
        openUserFormModal={openFormModal}
        setOpenUserFormModal={setOpenFormModal}
        populateUsers={populateTable}
      />

      <Container
        maxWidth="false"
        sx={{
          paddingBlock: 1.5,

          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <SearchBar
          type="users"
          data={data}
          setSearchResults={setSearchResults}
        />

        <Button
          variant="contained"
          size="medium"
          startIcon={<AddCircleIcon />}
          onClick={() => {
            setUser();
            setOpenFormModal(true);
          }}
        >
          Add user
        </Button>
      </Container>

      <Container maxWidth="false">
        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center" }}>
            <CircularProgress size={100} />
          </Box>
        ) : data?.length <= 0 ? (
          <Typography variant="h4" align="center">
            {"No users :("}
          </Typography>
        ) : (
          <TableComponent
            tableColumns={tableColumns}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            type="users"
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          ></TableComponent>
        )}
      </Container>
    </>
  );
}
