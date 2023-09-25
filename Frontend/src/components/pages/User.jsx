import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from "@mui/icons-material/";

import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserContext from "../../context/UserContext";
import ToastContext from "../../context/ToastContext";
import DeleteAlertContext from "../../context/DeleteAlertContext";

import UserForm from "../forms/UserForm";

import SearchBar from "./partial/SearchBar";
import TableComponent from "./partial/TableComponent";

const userTemplateInfo = {
  loginEmail: "john.doe@gmail.com",
  authority: "ADMINISTRATOR",
  firstName: "John",
  lastName: "Doe",
  notificationEmail: "john.doe@gmail.com",
  description: "Default humanoid being.",
  nickname: "JD",
  responsibilities: [
    {
      projectName: "Some project name",
      function: "Project member",
    },
    {
      projectName: "Some other project",
      function: "Project responsible",
    },
  ],
  collaborations: [
    {
      id: 1,
      companyName: "Company",
      projectName: "Project",
      responsible: "John Doe",
      contact: "Jane Smith",
      priority: false,
      category: "FINANCIAL",
      status: "CONTACTED",
      comment:
        "Sample comment 1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa a daw dawdawwd awdawda dwd ",
      achievedValue: 75,
    },
    {
      id: 2,
      companyName: "Company name other",
      projectName: "Project other",
      responsible: "John Doe",
      contact: "Jane Smith",
      priority: true,
      category: "FINANCIAL",
      status: "CONTACTED",
      comment:
        "Sample comment 1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa a daw dawdawwd awdawda dwd ",
      achievedValue: 75,
    },
  ],
};

const tableColumns = [
  {
    key: "companyName",
    label: "Company name",
  },
  {
    key: "projectName",
    label: "Project name",
  },
  {
    key: "responsible",
    label: "Responsible",
    xsHide: true,
  },
  {
    key: "status",
    label: "Status",
    centerContent: true,
  },
  {
    key: "contact",
    label: "Contact",
    xsHide: true,
  },
  {
    key: "category",
    label: "Category",
    notSortable: true,
    centerContent: true,
    xsHide: true,
    mdHide: true,
  },
  {
    key: "achievedValue",
    label: "Value",
    xsHide: true,
  },
  {
    key: "comment",
    label: "Comment",
    xsHide: true,
    mdHide: true,
    showTooltip: true,
  },
];

function filterCollabsColumns(columnsArray) {
  const keysToKeep = ["companyName", "projectName"];

  return columnsArray.filter((obj) => keysToKeep.includes(obj.key));
}

export default function User() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { user } = useContext(UserContext);
  const { handleOpenToast } = useContext(ToastContext);
  const { setOpenDeleteAlert, setObject, setEndpoint, setFetchUpdatedData } =
    useContext(DeleteAlertContext);

  const [openUserFormModal, setOpenUserFormModal] = useState(false);
  const [openCollaborationFormModal, setOpenCollaborationFormModal] =
    useState(false);
  const [collaboration, setCollaboration] = useState();

  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingSoftLockButton, setLoadingSoftLockButton] = useState(false);

  async function fetchUser() {
    setLoading(true);

    const JWToken = JSON.parse(localStorage.getItem("loginInfo")).JWT;

    try {
      const serverResponse = await fetch("/api/users/" + userId, {
        method: "GET",
        headers: { googleTokenEncoded: JWToken.credential },
      });
      if (serverResponse.ok) {
        const json = await serverResponse.json();

        setUserInfo(json);
        setSearchResults(
          json.collaborations
            .map((collaboration) => {
              return collaboration.name;
            })
            .sort((a, b) => (b.priority ? 1 : -1)) // sort the rows by prirority attribute on first load
        );
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

  function handleEditUser() {
    setOpenUserFormModal(true);
  }

  function navigateUsers() {
    navigate("/users");
  }

  function handleDeleteUser() {
    setObject({ type: "User", name: user.firstName + " " + user.lastName });
    setEndpoint("/api/users/" + user.id);
    setFetchUpdatedData({ function: navigateUsers });

    setOpenDeleteAlert(true);
  }

  async function handleSoftLockUser() {
    setLoadingSoftLockButton(true);

    const JWToken = JSON.parse(localStorage.getItem("loginInfo")).JWT;

    try {
      const serverResponse = await fetch(
        "/api/users/" + user.id + "/softLock",
        {
          method: "PATCH",
          headers: { googleTokenEncoded: JWToken.credential },
        }
      );

      if (serverResponse.ok) {
        const json = await serverResponse.json();
        user.softLocked = json;

        handleOpenToast({
          type: "success",
          info: `User ${user.firstName} ${user.lastName} soft locked.`,
        });
      } else {
        handleOpenToast({
          type: "error",
          info: "A server error occurred whilst soft locking.",
        });
      }
    } catch (error) {
      handleOpenToast({
        type: "error",
        info: "An error occurred whilst trying to connect to server.",
      });
    }
    setLoadingSoftLockButton(false);
  }

  function handleEditCollaboration(collaboration) {
    setCollaboration(collaboration);
    setOpenCollaborationFormModal(true);
  }

  function handleDeleteCollaboration(collaboration) {
    setObject({ type: "Collaboration", name: collaboration.name });
    setEndpoint("/api/collaborations/" + collaboration.id);
    setFetchUpdatedData({ function: fetchUser });

    setOpenDeleteAlert(true);
  }

  useEffect(() => {
    fetchUser();

    setSearchResults(
      userTemplateInfo.collaborations.sort((a, b) => (b.priority ? 1 : -1))
    ); // TODO: remove when backend is connected
  }, []);

  return (
    <>
      <UserForm
        openModal={openUserFormModal}
        setOpenModal={setOpenUserFormModal}
        fetchUpdatedData={fetchUser}
        object={user}
      />

      <Box
        sx={{
          display: "flex",

          maxHeight: "calc(100% - 64px)",
        }}
      >
        {/* details */}
        <Box
          sx={{
            flexBasis: "30%",

            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 0.5,
            }}
          >
            <Button
              variant="contained"
              startIcon={<KeyboardArrowLeftIcon />}
              onClick={() => {
                navigate("/users");
              }}
              sx={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,

                marginBlock: 2,
              }}
            >
              Users
            </Button>

            <Box
              sx={{
                marginRight: 2,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <Tooltip
                title={user.softLocked ? "Soft unlock" : "Soft lock"}
                key="Soft lock"
              >
                <IconButton
                  size="small"
                  onClick={handleSoftLockUser}
                  sx={{
                    color: "white",
                    backgroundColor: "#1976d2",

                    borderRadius: 1,
                  }}
                >
                  {loadingSoftLockButton ? (
                    <CircularProgress
                      size={17}
                      sx={{
                        color: "white",
                      }}
                    />
                  ) : user.softLocked ? (
                    <LockOpenIcon />
                  ) : (
                    <LockIcon />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit" key="Edit">
                <IconButton
                  size="small"
                  disabled={user.softLocked}
                  onClick={handleEditUser}
                  sx={{
                    color: "white",
                    backgroundColor: "#1976d2",

                    borderRadius: 1,
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" key="Delete">
                <IconButton
                  size="small"
                  disabled={user.softLocked}
                  onClick={handleDeleteUser}
                  sx={{
                    color: "white",
                    backgroundColor: "#1976d2",

                    borderRadius: 1,
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box
            sx={{
              marginBottom: 2,
              marginInline: 2,
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 500,
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              {userTemplateInfo.firstName + " " + userTemplateInfo.lastName}
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  sx={{
                    textTransform: "uppercase",
                  }}
                >
                  USER INFO
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemText
                      primary={"Login email: " + userTemplateInfo.loginEmail}
                    />
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemText
                      primary={"Authority: " + userTemplateInfo.authority}
                    />
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemText
                      primary={
                        "Notification email: " +
                        userTemplateInfo.notificationEmail
                      }
                    />
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemText
                      primary={"Nickname: " + userTemplateInfo.nickname}
                    />
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemText
                      primary={"Description: " + userTemplateInfo.description}
                      sx={{ maxHeight: 60, overflowY: "auto" }}
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  sx={{
                    textTransform: "uppercase",
                  }}
                >
                  Responsibilities
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {userTemplateInfo.responsibilities?.length > 0 ? (
                  <List dense>
                    {userTemplateInfo.responsibilities.map((responsibility) => (
                      <ListItem
                        key={responsibility.projectName}
                        disableGutters
                        disablePadding
                      >
                        <ListItemText
                          primary={responsibility.projectName}
                          secondary={responsibility.function}
                          secondaryTypographyProps={{ sx: { paddingLeft: 2 } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="h6" align="center" gutterBottom>
                    {"No responsibilities :("}
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>

        {/* collaborations */}
        <Box
          sx={{
            flex: 1,

            overflowY: "auto",
          }}
        >
          <Container
            maxWidth="false"
            sx={{
              paddingBlock: 2,

              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <SearchBar
              type="collaborations"
              data={userTemplateInfo.collaborations}
              setSearchResults={setSearchResults}
            />
          </Container>

          <Container maxWidth="false">
            {loading ? (
              <Box sx={{ display: "grid", placeItems: "center" }}>
                <CircularProgress size={100} />
              </Box>
            ) : userTemplateInfo.collaborations?.length > 0 ? (
              <TableComponent
                // TODO: user.maxAuthLevel >= 3
                // || (user.maxAuthLevel >= 0 && user himself)
                tableColumns={
                  user?.maxAuthLevel >= 3
                    ? tableColumns
                    : filterCollabsColumns(tableColumns)
                }
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                // TODO: handleView={handleView} when we add activites
                // TODO: user.maxAuthLevel >= 4
                // || (user.maxAuthLevel >= 3 && user is creator of that project)
                // || (user.maxAuthLevel >= 2 && user is project responsible for that project)
                // || (user.maxAuthLevel >= 1 && user is responsible for the company in that collaboration)
                handleEdit={user?.maxAuthLevel >= 4 && handleEditCollaboration}
                // TODO: user.maxAuthLevel >= 4
                // || (user.maxAuthLevel >= 3 && user is creator of that project)
                // || (user.maxAuthLevel >= 2 && user is project responsible for that project)
                handleDelete={
                  user?.maxAuthLevel >= 4 && handleDeleteCollaboration
                }
              />
            ) : (
              <Typography variant="h4" align="center">
                {"No collaborations :("}
              </Typography>
            )}
          </Container>
        </Box>
      </Box>
    </>
  );
}
