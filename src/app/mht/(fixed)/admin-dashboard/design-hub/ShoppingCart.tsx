"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Delete,
  ShoppingCart as CartIcon,
  Add,
  Remove,
  Inventory2,
} from "@mui/icons-material";
import type { CatalogItem } from "./catalogData";

// Design request (custom) item originally from ItemDialog
export interface DesignCartItem {
  id: string;
  itemTitle: string;
  itemType: string; // flyers | certificates | signs-banners
  purpose: string;
  theme: string;
  dueDate: string;
  englishText: string;
  spanishText: string;
  qrCodes?: string;
  size: string;
  otherSize?: string;
}

// Promotional catalog items are now boolean (single selection per item)

interface CombinedCartProps {
  designItems: DesignCartItem[];
  promotionalItems: CatalogItem[];
  onRemoveDesignItem: (id: string) => void;
  onRemovePromotionalItem: (id: string) => void;
}

export function ShoppingCart({
  designItems,
  promotionalItems,
  onRemoveDesignItem,
  onRemovePromotionalItem,
}: CombinedCartProps) {
  const totalDesign = designItems.length;
  const totalPromotional = promotionalItems.length;
  const total = totalDesign + totalPromotional;

  return (
    <Card>
      <CardHeader>
        <Typography
          variant="h6"
          component="div"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <CartIcon /> Cart ({total})
        </Typography>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 2 }}
          >
            Your cart is empty.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Design / Custom Items Section */}
            {totalDesign > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <Inventory2 fontSize="small" /> Design Requests ({totalDesign}
                  )
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {designItems.map((item) => (
                    <Card key={item.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 0.5,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle2"
                            component="h4"
                            sx={{ lineHeight: 1.2 }}
                          >
                            {item.itemTitle}
                          </Typography>
                          <Chip
                            label={item.itemType.replace("-", " ")}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        <Tooltip title="Remove item">
                          <IconButton
                            size="small"
                            onClick={() => onRemoveDesignItem(item.id)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box
                        sx={{
                          fontSize: "0.75rem",
                          lineHeight: 1.2,
                          "& > div": { mb: 0.5 },
                        }}
                      >
                        <div>
                          <strong>Purpose:</strong> {item.purpose}
                        </div>
                        <div>
                          <strong>Theme:</strong> {item.theme}
                        </div>
                        <div>
                          <strong>Due:</strong> {item.dueDate}
                        </div>
                        <div>
                          <strong>Size:</strong>{" "}
                          {item.size === "other" ? item.otherSize : item.size}
                        </div>
                        {item.englishText && (
                          <div>
                            <strong>Eng:</strong>{" "}
                            {item.englishText.substring(0, 40)}
                            {item.englishText.length > 40 ? "…" : ""}
                          </div>
                        )}
                        {item.spanishText && (
                          <div>
                            <strong>Esp:</strong>{" "}
                            {item.spanishText.substring(0, 40)}
                            {item.spanishText.length > 40 ? "…" : ""}
                          </div>
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
            {totalDesign > 0 && totalPromotional > 0 && <Divider />}

            {/* Promotional Items Section */}
            {totalPromotional > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <Inventory2 fontSize="small" /> Promotional Items (
                  {totalPromotional})
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {promotionalItems.map((item) => (
                    <Card key={item.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle2"
                            component="h4"
                            sx={{ lineHeight: 1.2 }}
                          >
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Box>
                        <Tooltip title="Remove item">
                          <IconButton
                            size="small"
                            onClick={() => onRemovePromotionalItem(item.id)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
