import React, { useState, useEffect, useContext } from "react";
import { Marker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { NerdGraphQuery, PlatformStateContext, NerdletStateContext } from "nr1";

import { nerdGraphSalesQuery } from "../queries";
import { FETCH_INTERVAL } from "../contstants";
import { createClusterCustomIcon, createCustomIcon } from "../utils/map";
import LocationPopup from "./LocationPopup";
import { useProps } from "../context/VizPropsProvider";

const Markers = () => {
  // const nerdletState = useContext(NerdletStateContext);
  const { accountId } = useProps();
  // timeRange formatting happens in the query (nerdGraphSalesQuery)
  const { timeRange } = useContext(PlatformStateContext);

  const [locations, setLocations] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const query = nerdGraphSalesQuery(timeRange);
      const variables = { id: parseInt(accountId) };

      try {
        const response = await NerdGraphQuery.query({ query, variables });
        const locations = response?.data?.actor?.account?.sales?.results;

        setLocations(locations);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error appropriately
      }
    };

    // Perform the immediate fetch to populate the initial data
    fetchData();

    // Then set an interval to continue fetching
    const intervalId = setInterval(fetchData, FETCH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [timeRange]);

  return (
    <MarkerClusterGroup
      singleMarkerMode={true}
      spiderfyOnMaxZoom={7}
      disableClusteringAtZoom={10}
      iconCreateFunction={createClusterCustomIcon}
    >
      {locations.map((location) => (
        <Marker
          key={location.storeNumber}
          position={[location.latitude, location.longitude]}
          icon={createCustomIcon(location)}
        >
          <LocationPopup location={location} />
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
};

export default Markers;
