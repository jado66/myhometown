"use client";
import { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Link,
  Divider,
  Button,
  Card,
  CardMedia,
  CardActions,
  CardContent,
  InputAdornment,
  TextField,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BackButton from "@/components/BackButton";
import Loading from "@/components/util/Loading";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import AddEditCityDialog from "@/components/data-tables/AddEditCityDialog";
import { useRouter } from "next/navigation";
import useManageCities from "@/hooks/use-manage-cities";
import { useUser } from "@/hooks/use-user";

export default function Management() {
  const theme = useTheme();
  const router = useRouter();

  const { user, isLoading } = useUser();
  const [cityToEdit, setCityToEdit] = useState(null);
  const { cities, handleAddCity, handleEditCity, handleDeleteCity, hasLoaded } =
    useManageCities(user);
  const [showAddCityForm, setShowAddCityForm] = useState(false);
  const [showConfirmDeleteCity, setShowConfirmDeleteCity] = useState(false);
  const [confirmDeleteCityProps, setConfirmDeleteCityProps] = useState({});

  const handleAskDeleteCity = (cityId) => {
    const city = cities.find((c) => c._id === cityId);
    setConfirmDeleteCityProps({
      title: "Delete City",
      description: `Are you sure you want to delete ${city.name}?`,
      onConfirm: () => {
        handleDeleteCity(city);
        setShowConfirmDeleteCity(false);
      },
      onCancel: () => setShowConfirmDeleteCity(false),
      onClose: () => setShowConfirmDeleteCity(false),
    });
    setShowConfirmDeleteCity(true);
  };

  const handleEditCitySubmit = (city) => {
    handleEditCity(cityToEdit, city);
    setCityToEdit(null);
  };

  const handleCloseCityForm = () => {
    setShowAddCityForm(false);
    setCityToEdit(null);
  };

  const toggleVisibility = (cityId) => {
    const city = cities.find((c) => c._id === cityId);
    const updatedCity = { ...city, visibility: !city.visibility };
    setConfirmDeleteCityProps({
      title: "Update City Visibility",
      description: `Are you sure you want to make ${city.name} ${
        updatedCity.visibility ? "public" : "hidden"
      }?`,
      onConfirm: () => {
        handleEditCity(city, updatedCity);
        setShowConfirmDeleteCity(false);
      },
      onCancel: () => setShowConfirmDeleteCity(false),
      onClose: () => setShowConfirmDeleteCity(false),
    });
    setShowConfirmDeleteCity(true);
  };

  const goToEditCity = (city) => {
    router.push(
      `/edit/${state.toLowerCase()}/${city.name
        .toLowerCase()
        .replaceAll(/\s/g, "-")}`
    );
  };

  useEffect(() => {
    if (cityToEdit) {
      setShowAddCityForm(true);
    }
  }, [cityToEdit]);

  const cityColumns = createCityColumns(
    handleAskDeleteCity,
    setCityToEdit,
    toggleVisibility
  );

  if (!hasLoaded) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        sx={{ height: "100vh", padding: "5em" }}
      >
        <Loading size={50} />
      </Box>
    );
  }

  return (
    <>
      <AskYesNoDialog
        {...confirmDeleteCityProps}
        open={showConfirmDeleteCity}
      />
      <AddEditCityDialog
        open={showAddCityForm}
        handleClose={handleCloseCityForm}
        onSubmitForm={cityToEdit ? handleEditCitySubmit : handleAddCity}
        initialCityState={cityToEdit}
      />

      <Grid
        container
        item
        sm={12}
        display="flex"
        sx={{ position: "relative", mt: "48px" }}
      >
        <BackButton />

        <Box marginBottom={4} width="100%">
          <Typography
            sx={{ textTransform: "uppercase", fontWeight: "medium" }}
            gutterBottom
            color={"primary"}
            align={"center"}
          >
            Admin City Management
          </Typography>
          <Typography
            component="div"
            fontWeight={700}
            variant={"h3"}
            align={"center"}
            gutterBottom
          >
            {cities.length === 1 ? "Manage your city." : "Manage your cities."}
          </Typography>
        </Box>

        {cities.length === 0 && hasLoaded && (
          <>
            <Divider width="50%" sx={{ mx: "auto", mb: 3 }} />
            <Typography
              variant={"subtitle1"}
              component={"p"}
              color={"textSecondary"}
              align={"center"}
              gutterBottom
            >
              You don&apos;t have any cities assigned to your account.
            </Typography>
            <Typography variant={"subtitle2"} align={"center"}>
              Expected something different?{" "}
              <Link
                component={"a"}
                color={"primary"}
                href={"mailto:JerryCraven@gmail.com"}
                underline={"none"}
              >
                Contact a myHometown Admin - JerryCraven@gmail.com
              </Link>
            </Typography>
          </>
        )}

        {cities.length === 1 && (
          <Box marginBottom={4} width="100%">
            <SingleCity
              city={cities[0]}
              goToEditCity={goToEditCity}
              handleEditCity={handleEditCity}
            />
          </Box>
        )}

        {cities.length > 1 && (
          <Box marginBottom={4} width="100%" px={3}>
            <MultipleCities
              cities={cities}
              cityColumns={cityColumns}
              handleAskDeleteCity={handleAskDeleteCity}
              setCityToEdit={setCityToEdit}
              toggleVisibility={toggleVisibility}
            />
          </Box>
        )}
      </Grid>
    </>
  );
}

function AddCityStatsForm({ city, updateCityStats }) {
  const [cityStats, setCityStats] = useState({
    volunteerHours: city?.stats?.volunteerHours || "",
    numTeachersVolunteers: city?.stats?.numTeachersVolunteers || "",
    numStudents: city?.stats?.numStudents || "",
    serviceDays: city?.stats?.serviceDays || "",
    serviceHours: city?.stats?.serviceHours || "",
    serviceVolunteers: city?.stats?.serviceVolunteers || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCityStats({
      ...cityStats,
      [name]: value,
    });
  };

  const validate = () => {
    let tempErrors = {};
    let valid = true;

    Object.keys(cityStats).forEach((key) => {
      if (
        !cityStats[key] ||
        isNaN(cityStats[key]) ||
        Number(cityStats[key]) <= 0
      ) {
        tempErrors[key] = "Value must be a number greater than 0";
        valid = false;
      }
    });

    setErrors(tempErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Handle form submission here
      updateCityStats({ ...city, stats: cityStats });
    }
  };

  return (
    <Box sx={{ p: 4 }} component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" textAlign="center">
        Total for 2024
      </Typography>
      <Typography variant="subtitle1" textAlign="center">
        Please update these values at the end of every month.
      </Typography>

      <Grid container spacing={2}>
        <Grid item lg={4}>
          <TextField
            label="Number of Volunteer Hours"
            type="number"
            name="volunteerHours"
            value={cityStats.volunteerHours}
            onChange={handleChange}
            error={errors.volunteerHours ? true : false}
            helperText={errors.volunteerHours}
            InputProps={{
              endAdornment: <InputAdornment position="end">hrs</InputAdornment>,
            }}
            variant="outlined"
            fullWidth
            margin="normal"
            sx={{ mb: 0 }}
          />
        </Grid>

        <Grid item lg={4}>
          <TextField
            label="Number of Teachers and Volunteers"
            type="number"
            name="numTeachersVolunteers"
            value={cityStats.numTeachersVolunteers}
            onChange={handleChange}
            error={errors.numTeachersVolunteers ? true : false}
            helperText={errors.numTeachersVolunteers}
            variant="outlined"
            fullWidth
            margin="normal"
            sx={{ mb: 0 }}
          />
        </Grid>
        <Grid item lg={4}>
          <TextField
            label="Number of Students Attending Classes"
            type="number"
            name="numStudents"
            value={cityStats.numStudents}
            onChange={handleChange}
            error={errors.numStudents ? true : false}
            helperText={errors.numStudents}
            variant="outlined"
            fullWidth
            margin="normal"
            sx={{ mb: 0 }}
          />
        </Grid>

        <Grid item lg={4}>
          <TextField
            label="Number of Days of Service Projects"
            type="number"
            name="serviceProjects"
            value={cityStats.serviceProjects}
            onChange={handleChange}
            error={errors.serviceProjects ? true : false}
            helperText={errors.serviceProjects}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        </Grid>

        <Grid item lg={4}>
          <TextField
            label="Days of Service Hours"
            type="number"
            name="serviceHours"
            value={cityStats.serviceHours}
            onChange={handleChange}
            error={errors.serviceHours ? true : false}
            helperText={errors.serviceHours}
            InputProps={{
              endAdornment: <InputAdornment position="end">hrs</InputAdornment>,
            }}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item lg={4}>
          <TextField
            label="Number of Days of Service Volunteers"
            type="number"
            name="serviceVolunteers"
            value={cityStats.serviceVolunteers}
            onChange={handleChange}
            error={errors.serviceVolunteers ? true : false}
            helperText={errors.serviceVolunteers}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        </Grid>
      </Grid>

      {/* Submit button */}
      <Button
        variant="contained"
        color="primary"
        type="submit"
        style={{ marginTop: "16px" }}
      >
        Submit Totals
      </Button>
    </Box>
  );
}

import { faker } from "@faker-js/faker";

export function SingleCity({ city, goToEditCity, handleEditCity }) {
  const theme = useTheme();

  const updateCityStats = (cityWithNewStats) => {
    handleEditCity(city, cityWithNewStats);
  };

  const communityCardSize = city?.communities?.length
    ? 12 / city.communities.length
    : 12;

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      display="flex"
      spacing={2}
    >
      <Grid item xs={12} sm={6} sx={{ width: 1, mb: 3 }}>
        <Box
          display="block"
          width="100%"
          height="100%"
          sx={{
            textDecoration: "none",
            transition: "all .2s ease-in-out",
            "&:hover": {
              transform: `translateY(-${theme.spacing(1 / 2)})`,
            },
          }}
        >
          <Card
            sx={{
              width: "50%",
              mx: "auto",
              height: "100%",

              borderRadius: 3,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            onClick={() => goToEditCity(city)}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={500} align="center">
                MyHometown {city.name}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                sx={{ mx: "auto", mb: 2 }}
                variant="outlined"
                color="primary"
                size="large"
                href={`/edit/${city.state.toLowerCase()}/${city.name
                  .toLowerCase()
                  .replaceAll(/\s/g, "-")}`}
              >
                Edit City Page
              </Button>
              <Button
                sx={{ mx: "auto", mb: 2 }}
                variant="outlined"
                color="primary"
                size="large"
                href={`/${city.state.toLowerCase()}/${city.name
                  .toLowerCase()
                  .replaceAll(/\s/g, "-")}`}
              >
                View City Page
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Grid>

      <Divider width="100%" sx={{ mx: "auto", mb: 3 }} />

      <Typography
        variant="h4"
        component="h2"
        color="primary"
        textAlign="center"
      >
        {city.name}&apos;s Communities
      </Typography>

      <Grid container spacing={2} padding={3}>
        {city.communities &&
          city.communities.map((community, index) => (
            <CommunityCard
              key={community.name}
              community={community}
              city={city.name}
              gridProps={{ xs: 12, sm: communityCardSize }}
              index={index}
            />
          ))}
      </Grid>

      <Divider width="100%" sx={{ mx: "auto", mb: 3 }} />

      <EventsCalendar events={city.events} onSelectEvent={() => {}} />

      {/* Form for adding volunteer hours */}
      {/* <Grid item xs={12} mt={4}>
        <AddCityStatsForm city={city} updateCityStats={updateCityStats} />
      </Grid> */}
    </Grid>
  );
}

import { createCityColumns } from "@/constants/columns";
// import { DataTable } from "@/components/data-tables/DataTable";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { CommunityCard } from "@/components/CommunityCard";
import { NotResponsiveAlert } from "@/util/NotResponsiveAlert";
import CityDataTable from "@/components/data-tables/CityDataTable";

export function MultipleCities({
  cities,
  cityColumns,
  handleAskDeleteCity,
  setCityToEdit,
  toggleVisibility,
}) {
  return (
    <CityDataTable
      id="city"
      data={cities}
      onRowClick={(row) => setCityToEdit(row)}
    />
  );
}
