export const zoomToCountry = (mapView, geometry) => {
  if (!mapView || !geometry) {
    return Promise.reject(new Error("MapView or geometry is missing"));
  }

  return mapView.goTo(
    {
      target: geometry.extent.expand(1.3),
    },
    {
      duration: 1500,
      easing: "ease-in-out",
    }
  );
};

export const queryCountry = (layer, countryName, includeGeometry = false) => {
  if (!layer || !countryName) {
    return Promise.reject(new Error("Layer or country name is missing"));
  }

  const query = layer.createQuery();
  query.where = `COUNTRY = '${countryName}'`;
  query.outFields = ["*"];
  query.returnGeometry = includeGeometry;

  return layer.queryFeatures(query);
};

export const queryAllCountries = (layer) => {
  if (!layer) {
    return Promise.reject(new Error("Layer is missing"));
  }

  const query = layer.createQuery();
  query.where = "1=1";
  query.outFields = ["*"];

  return layer.queryFeatures(query);
};
