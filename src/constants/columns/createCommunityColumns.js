import { Button, Grid, Tooltip } from "@mui/material";
import { OnwersCell } from "../../components/data-tables/CityOrCommunityOwnersCell";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";

const createCommunityColumns = (
  handleAskDeleteCommunity,
  setCommunityToEdit,
  toggleVisibility,
  user
) => [
  { field: "_id", headerName: "ID", width: 90, visible: false },
  { field: "name", headerName: "Community Name", width: 150 },
  {
    field: "city",
    headerName: "City",
    width: 125,
    renderCell: (params) => params.row.city?.name || "",
  },
  {
    field: "state",
    headerName: "State",
    width: 100,
    renderCell: (params) => params.row.city?.state || "",
  },
  { field: "country", headerName: "Country", width: 150 },
  {
    field: "visibility",
    headerName: "Status",
    width: 100,
    renderCell: (params) => (params.row.visibility ? "Published" : "Draft"),
  },
  {
    field: "communityOwners",
    headerName: "Managers",
    width: 350,
    renderCell: (params) => <OnwersCell params={params} />,
  },

  {
    field: "actions",
    headerName: "Actions",
    sortable: false,
    width: 325,
    disableClickEventBubbling: true,
    renderCell: (params) => {
      const onToggleVisibility = () => {
        toggleVisibility(params.row._id);
      };

      const onClickDelete = () => {
        handleAskDeleteCommunity(params.row._id);
      };

      const onClickEdit = () => {
        setCommunityToEdit(params.row);
      };

      const href = params.row.city
        ? `/${params.row.city.state
            .toLowerCase()
            .replaceAll(/\s/g, "-")}/${params.row.city.name
            .toLowerCase()
            .replaceAll(/\s/g, "-")}/${params.row.name
            .toLowerCase()
            .replaceAll(/\s/g, "-")}`
        : "";

      if (user?.role !== "Admin" && params.row.city && params.row.name) {
        return (
          <Grid>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              sx={{ color: "grey" }}
              href={href}
              disabled={!href}
            >
              View Page
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              href={"/edit" + href}
              disabled={!href}
            >
              <DeleteIcon fontSize="small" sx={{ ml: "5px" }} />
              Edit Page
            </Button>
          </Grid>
        );
      } else if (user.role === "Admin") {
        return (
          <Grid>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              sx={{ color: "grey" }}
              onClick={onClickEdit}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={onToggleVisibility}
              sx={{ color: "grey", ml: 1, width: 135 }}
            >
              {params.row.visibility ? "Make Draft" : "Publish"}
              {params.row.visibility ? (
                <VisibilityOff fontSize="small" sx={{ ml: "5px" }} />
              ) : (
                <Visibility fontSize="small" sx={{ ml: "5px" }} />
              )}
            </Button>

            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onClickDelete}
              sx={{ marginLeft: 1 }}
            >
              <Tooltip title="Delete Community" placement="top" arrow>
                <DeleteIcon fontSize="small" />
              </Tooltip>
            </Button>
          </Grid>
        );
      }

      return null;
    },
  },
];

export { createCommunityColumns };
