import { useState, useEffect, use } from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { useDayOfServiceId } from "@/contexts/DayOfServiceIdProvider";
import moment from "moment";
import { useClassSignup } from "../ClassSignupContext";

// Day of Service Component using MUI
export const DayOfServiceSelect = ({
  field,
  config,
  value,
  onChange,
  error,
}) => {
  const [serviceOptions, setServiceOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const { updateDayOfService } = useDayOfServiceId();

  const params = useParams();

  const { fetchDaysOfServiceByCommunity } = useDaysOfService();

  useEffect(() => {
    const fetchServiceOptions = async () => {
      if (!params?.cityQuery || !params?.communityQuery) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const city = params.cityQuery
          .replaceAll(/-/g, " ")
          .replaceAll(/%20/g, " ");
        const community = params.communityQuery
          .replaceAll(/-/g, " ")
          .replaceAll(/%20/g, " ");

        const key = `${community}`;

        const communityId = keyToCommunityId[key];

        const { data } = await fetchDaysOfServiceByCommunity(communityId);

        if (!data) {
          throw new Error("No data returned");
        }

        // Sort the data by end_date before mapping to options
        const sortedData = [...data].sort(
          (a, b) => moment(a.end_date).valueOf() - moment(b.end_date).valueOf(),
        );

        const dayOptions = sortedData.map((day) => ({
          value: day.id,
          label: moment(day.end_date).format("dddd, MMMM Do, YYYY"),
        }));

        setServiceOptions(dayOptions || []);
      } catch (err) {
        console.error("Error fetching service days:", err);
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceOptions();
  }, [params, fetchDaysOfServiceByCommunity]);

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    onChange(selectedValue);
    updateDayOfService(selectedValue);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl
        required={config.required}
        error={!!error}
        fullWidth
        disabled={loading}
      >
        <FormLabel id={`${field}-label`}>
          {config.label || "Day of Service"}
        </FormLabel>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : fetchError ? (
          <FormHelperText error>{fetchError}</FormHelperText>
        ) : (
          <Select
            labelId={`${field}-label`}
            id={field}
            value={value || ""}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              {config.placeholder || "Select a day of service"}
            </MenuItem>

            {/* Move the MenuItems inside the Select component */}
            {serviceOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        )}
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export const keyToCommunityId = {
  "geneva heights": "a78e8c7c-eca4-4f13-b6c8-e5603d1c36da",
  "pioneer park": "b3381b98-e44f-4f1f-b067-04e575c515ca",
  dixon: "7c446e80-323d-4268-b595-6945e915330f",
  "south freedom": "7c8731bc-1aee-406a-9847-7dc1e5255587",
  north: "0806b0f4-9d56-4c1f-b976-ee04f60af194",
  south: "bf4a7d58-b880-4c18-b923-6c89e2597c71",
  west: "0bdf52a4-2efa-465b-a3b1-5ec4d1701967",
  central: "995c1860-9d5b-472f-a206-1c2dd40947bd",
  northwest: "af0df8f5-dab7-47e4-aafc-9247fee6f29d",
  westside: "5de22b0b-5dc8-4d72-b424-95b0d1c94fcc",
  "central granger": "252cd4b1-830c-4cdb-913f-a1460f218616",
  "north east granger": "4687e12e-497f-40a2-ab1b-ab455f250fce",
  "west granger": "2bc57e19-0c73-4781-9fc6-ef26fc729847",
  "central valley view": "0076ad61-e165-4cd0-b6af-f4a30af2510c",
  "sharon park": "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e",
  layton: "7d059ebc-78ee-4b47-97ab-276ae480b8de",
  santaquin: "724b1aa6-0950-40ba-9453-cdd80085c5d4",
};
