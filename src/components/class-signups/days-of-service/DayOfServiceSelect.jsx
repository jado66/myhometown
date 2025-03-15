import { useState, useEffect } from "react";
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
import { communityIdMap } from "@/util/communityIdMap";
import { useDayOfServiceId } from "@/contexts/DayOfServiceIdProvider";
import moment from "moment";

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

        const key = `${city}-${community}`;

        const communityId = communityIdMap[key];

        if (!communityId) {
          throw new Error(`Community not found for: ${key}`);
        }

        const { data } = await fetchDaysOfServiceByCommunity(communityId);

        if (!data) {
          throw new Error("No data returned");
        }

        // Sort the data by end_date before mapping to options
        const sortedData = [...data].sort(
          (a, b) => moment(a.end_date).valueOf() - moment(b.end_date).valueOf()
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
