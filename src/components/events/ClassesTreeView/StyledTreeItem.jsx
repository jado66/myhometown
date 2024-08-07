import { styled } from "@mui/material";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
export const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  "& .MuiTreeItem-content": {
    paddingTop: "12px",
    paddingBottom: "12px",
    flexDirection: "row-reverse",
  },
}));
