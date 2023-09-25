import {
  Backdrop,
  Modal,
  Fade,
  Button,
  Typography,
  FormControl,
  IconButton,
  Box,
} from "@mui/material";
import {
  Clear as RemoveIcon,
} from "@mui/icons-material/";
import { LoadingButton } from "@mui/lab";

import { useState, useContext, useEffect } from "react";

import ToastContext from "../../context/ToastContext";

import CustomAutocomplete from "./partial/CustomAutocomplete";

export default function ManageTeamForm({
  object: existingTeamMembers,
  openModal,
  setOpenModal,
  projectId,
  fetchUpdatedData,
}) {
  const { handleOpenToast } = useContext(ToastContext);

  const [existingUsers, setExistingUsers] = useState([]);
  const [loadingButton, setLoadingButton] = useState(false);

  const [formData, setFormData] = useState({
    entity: {
        teamMemberIds: [],
    },
    validation: {
        teamMemberIdsAreValid: false,
    },
  });

  async function fetchExistingUsers() {
    const JWToken = JSON.parse(localStorage.getItem("loginInfo")).JWT;

    try {
      const serverResponse = await fetch("/api/users/", {
        method: "GET",
        headers: { googleTokenEncoded: JWToken.credential },
      });

      if (serverResponse.ok) {
        const json = await serverResponse.json();

        // console.log(json);
        setExistingUsers(json);
      } else {
        handleOpenToast({
          type: "error",
          info: "A server error occurred whilst fetching users for Project responsible input field.",
        });
      }
    } catch (error) {
      handleOpenToast({
        type: "error",
        info: "An error occurred whilst trying to connect to server.",
      });
    }
  }

  function handleRemoveTeamMember(index) {
    formData.entity.teamMemberIds.splice(index, 1);
    setFormData({
      entity: {
        teamMemberIds: formData.entity.teamMemberIds,
      },
      validation: {
        teamMemberIdsAreValid: true,
      },
    });
  }

  async function submit() {

    setLoadingButton(true);
    const JWToken = JSON.parse(localStorage.getItem("loginInfo")).JWT;

    const request = {
      method: "PATCH",
      headers: {
        googleTokenEncoded: JWToken.credential,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData.entity.teamMemberIds),
    };

    const serverResponse = await fetch(
      `/api/projects/${projectId}/projectMembers`,
      request
    );

    if (serverResponse.ok) {
      handleOpenToast({
        type: "success",
        info:
          "Team members updated",
      });

      setOpenModal(false);
      fetchUpdatedData();
    } else if (serverResponse.status === 400) {
      handleOpenToast({
        type: "error",
        info: "Invalid project details.",
      });
    } else if (serverResponse.status === 403) {
      handleOpenToast({
        type: "error",
        info: "Moderator privileges are required for manipulating projects.",
      });
    } else if (serverResponse.status === 404) {
      handleOpenToast({
        type: "error",
        info: "Project with id " + projectId + " does not exist.",
      });
    } else {
      handleOpenToast({
        type: "error",
        info:
          "An unknown error occurred whilst trying to manage project team.",
      });
    }

    setLoadingButton(false);
  }

  if (existingTeamMembers) {
    existingTeamMembers.sort();
  }

  useEffect(() => {
    setFormData({
      entity: {
        teamMemberIds: existingTeamMembers ?? [],
      },
      validation: {
        teamMemberIdsAreValid: true,
      },
    });

    fetchExistingUsers();
  }, [openModal]);

  useEffect(() => {
    if (formData.entity.teamMemberIds.length !== 0)
    {
        if (formData.entity["teamMemberIds"][0] != null) {
            var newTeamMembers = formData.entity["teamMemberIds"];
            newTeamMembers.unshift(null)
            setFormData({
              entity: {
                teamMemberIds: newTeamMembers,
              },
              validation: {
                teamMemberIdsAreValid: true,
              },
            });
        }
    }
    else {
        setFormData({
          entity: {
            teamMemberIds: [null],
          },
          validation: {
            teamMemberIdsAreValid: true,
          },
        });
    }
  }, [formData]);

  return (
    <Backdrop open={openModal}>
      <Modal
        open={openModal}
        closeAfterTransition
        // submit on Enter key
        onKeyDown={(e) => {
          // TODO: replace when this form is refractored
          // const formIsValid = Object.values(formData.validation).every(Boolean);

          // if (e.key === "Enter" && formIsValid) {
          //   submit();
          // }
          if (e.key === "Enter") {
            submit();
          }
        }}
        // close on Escape key
        onClose={() => {
          setOpenModal(false);
        }}
      >
        <Fade in={openModal}>
          <FormControl
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",

              maxWidth: "95%",
              width: "30rem",

              maxHeight: "95%",

              borderRadius: "1.5rem",
              padding: "1rem",

              backgroundColor: "whitesmoke",
              boxShadow: "#666 2px 2px 8px",
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ textTransform: "uppercase", fontWeight: "bold" }}
            >
              {"Manage project team"}
            </Typography>

            <Box
              sx={{
                overflowY: "auto",
              }}
            >
              {formData?.entity.teamMemberIds?.map(function(object, i){
                return (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "10fr 1fr",
                    alignItems: "center",
                  }}
                onBlur = {() => {
                    if (i !== 0 && formData.entity.teamMemberIds[i] == null)
                    {
                      handleRemoveTeamMember(i)
                    }
                }}
                >
                    <CustomAutocomplete
                      options={existingUsers.filter(x => !formData.entity.teamMemberIds.includes(x.id)
                                                         || formData.entity.teamMemberIds[i] === x.id)}
                      entityKey="teamMemberIds"
                      validationKey="teamMemberIdsAreValid"
                      label="Collaboration responsible"
                      formatter={(option) => option.firstName + " " + option.lastName}
                      formData={formData}
                      setFormData={setFormData}
                      listIndex = {i}
                    />
                    <Box>
                       <IconButton
                          aria-label="remove frTeamMember"
                          onClick={(e) =>
                            handleRemoveTeamMember(i)
                          }
                          sx={{
                            width: 20,
                            height: 20,

                            margin: 1,

                            color: "white",
                            backgroundColor: "#1976d2",
                            borderRadius: 1,
                          }}
                       >
                          <RemoveIcon
                            sx={{
                              width: 15,
                              height: 15,
                            }}
                          />
                       </IconButton>
                    </Box>
                </Box>)
              })}
            </Box>

            <Box
              sx={{
                marginBlock: "3%",

                display: "flex",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  setOpenModal(false);
                }}
              >
                Cancel
              </Button>

              <LoadingButton
                variant="contained"
                onClick={submit}
                loading={loadingButton}
              >
                {/* span needed because of bug */}
                <span>{"Manage project team"}</span>
              </LoadingButton>
            </Box>
          </FormControl>
        </Fade>
      </Modal>
    </Backdrop>
  );
}
