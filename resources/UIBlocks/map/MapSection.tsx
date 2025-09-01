import React from "react";
import WorldMap from "./WorldMap"; // your WorldMap component
import Button from "../../components/button/Button";
import { useNavigate } from "react-router-dom";

type Location = {
  name: string;
  coordinates: [number, number];
};

type MapSectionProps = {
  title: string;
  description: string;
  buttonLabel: string;
  buttonPath: string;
  // WorldMap props
  startLocationName: string;
  lineColor?: string;
  markerColor?: string;
  startMarkerColor?: string;
  textColor?: string;
  fontSize?: number;
  locations: Location[];
  mapImage: string;
  mapAlign?: "left" | "right"; // left or right alignment
};

const MapSection: React.FC<MapSectionProps> = ({
  title,
  description,
  buttonLabel,
  buttonPath,
  startLocationName,
  lineColor = "green",
  markerColor = "green",
  startMarkerColor = "red",
  textColor = "black",
  fontSize = 2,
  locations,
  mapImage,
  mapAlign = "right",
}) => {
 
  return (
    <div
      className={`grid gap-4 ${
        mapAlign === "left" ? "grid-cols-1 md:grid-cols-[70%_30%]" : "grid-cols-1 md:grid-cols-[30%_70%]"
      } items-center`}
    >
      {/* Text section */}
      {mapAlign === "right" && (
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <h3 className="mt-2 text-lg">{description}</h3>
          <div className="mt-4">
            <Button
              className="bg-primary text-primary-foreground"
              arrowRight={true}
              scrollToId={`${buttonPath}`}
            >
              {buttonLabel}
            </Button>
          </div>
        </div>
      )}

      {/* Map section */}
      <WorldMap
        startLocationName={startLocationName}
        lineColor={lineColor}
        markerColor={markerColor}
        startMarkerColor={startMarkerColor}
        textColor={textColor}
        locations={locations}
        mapImage={mapImage}
        fontSize={fontSize}
      />

      {/* If mapAlign is left, text goes after map */}
      {mapAlign === "left" && (
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <h3 className="mt-2 text-lg">{description}</h3>
          <div className="mt-4">
            <Button
              className="bg-primary text-primary-foreground"
              arrowRight={true}
              scrollToId={`${buttonPath}`}
            >
              {buttonLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSection;


 {/* <div className="px-4 py-10 lg:px-[10%]">
          <MapSection
            title="Our Global Presence"
            description="See where our offices and key client locations are situated across the world. We are proud to serve clients in multiple regions, connecting businesses globally."
            buttonLabel="Contact Us"
            buttonPath="contact"
            startLocationName="India"
            lineColor="orange"
            markerColor="blue"
            startMarkerColor="red"
            textColor="black"
            locations={[
              { name: "India", coordinates: [-27.106713, -62.113318] }, //{x,y}
              { name: "Gujarat", coordinates: [-58.2772, -4.0583] },
              { name: "Delhi", coordinates: [-27.2529, 62.2048] },
              { name: "Odisha", coordinates: [10.0, -10.0] },
            ]}
            mapImage="/assets/india.png"
            mapAlign="right"
            fontSize={5}
          />
        </div> */}