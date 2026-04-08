import React from "react";
import { Paper, Box, Typography, Card, Chip, IconButton } from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { CatalogItem } from "./catalogData";

interface SelectedItemsCartProps {
  selectedItems: string[];
  selectedItemsData: CatalogItem[];
  removeFromCart: (id: string) => void;
}

export default function SelectedItemsCart({
  selectedItems,
  selectedItemsData,
  removeFromCart,
}: SelectedItemsCartProps) {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <ShoppingCartIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Selected Items ({selectedItems.length})
        </Typography>
      </Box>
      {selectedItems.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 2 }}
        >
          No items selected yet. Browse the catalog and select items to add them
          here.
        </Typography>
      ) : (
        <Box>
          {selectedItemsData.map((item) => (
            <Box key={item.id} sx={{ mb: 2 }}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {item.title}
                    </Typography>
                    <Chip
                      label={
                        item.category === "starter-kit"
                          ? "Starter Kit"
                          : item.category === "design"
                          ? "Design"
                          : "Swag"
                      }
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => removeFromCart(item.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
