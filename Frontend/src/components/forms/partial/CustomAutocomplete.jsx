import { TextField, Autocomplete } from "@mui/material";

export default function CustomAutocomplete({
  options,
  entityKey,
  validationKey,
  label,
  formatter,
  disabledCondition = false,
  helperTextCondition = null,
  helperText = "",
  formData,
  setFormData,
  listIndex = null
}) {
  var entityValue = listIndex === null ? formData.entity[entityKey] : formData.entity[entityKey][listIndex]
  return (
    <Autocomplete
      options={options}
      clearOnEscape
      openOnFocus
      disabled={disabledCondition}
      value={
        options.find((option) => option.id === entityValue) ||
        null
      }
      getOptionLabel={formatter}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      filterOptions={(options, { inputValue }) =>
        options.filter((option) =>
          formatter(option).toLowerCase().includes(inputValue.toLowerCase())
        )
      }
      onChange={(e, newValue) => {
        if (listIndex === null)
        {
            if (newValue) {
              setFormData((prevData) => ({
                entity: {
                  ...prevData.entity,
                  [entityKey]: newValue.id,
                },
                validation: {
                  ...prevData.validation,
                  [validationKey]: options.some(
                    (option) => option.id === newValue.id
                  ),
                },
              }));
            } else {
              setFormData((prevData) => ({
                entity: {
                  ...prevData.entity,
                  [entityKey]: null,
                },
                validation: {
                  ...prevData.validation,
                  [validationKey]: false,
                },
              }));
            }
        }
        else
        {
            if (newValue) {
              setFormData((prevData) => {
                const newData = {
                    entity: {
                      ...prevData.entity,
                    },
                    validation: {
                      ...prevData.validation,
                      [validationKey]: options.some((option) => option.id === newValue.id),
                    },
                };
                newData.entity[entityKey][listIndex] = newValue.id;
                return newData;
              });
            } else {
              setFormData((prevData) => {
                const newData = {
                    entity: {
                      ...prevData.entity,
                    },
                    validation: {
                      ...prevData.validation,
                      [validationKey]: false,
                    },
                };
                newData.entity[entityKey][listIndex] = null;
                return newData;
              });
            }
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required
          fullWidth
          margin="dense"
          helperText={helperTextCondition ? helperText : ""}
        />
      )}
    />
  );
}
