function createCityObject(form) {
    const cityObject = {
      name: form.cityName.value,
      country: form.country.value,
      population: parseInt(form.population.value),
      coordinates: {
        latitude: parseFloat(form.latitude.value),
        longitude: parseFloat(form.longitude.value)
      },
      bulletinBoard: [],
      classes: [],
      numbers: {}
    }
    return cityObject;
}

export default createCityObject;