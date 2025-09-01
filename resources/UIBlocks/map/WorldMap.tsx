import React from "react";

type Location = {
  name: string;
  coordinates: [number, number];
};

type WorldMapProps = {
  locations: Location[];
  startLocationName?: string;
  lineColor?: string;
  markerColor?: string;
  startMarkerColor?: string;
  textColor?: string;
  fontSize?: number;
  mapImage?: string;
};

// Equirectangular projection relative to viewBox
const project = (lon: number, lat: number) => {
  const x = lon + 180; // map 0-360
  const y = 90 - lat; // map 0-180
  return [x, y];
};

const WorldMap: React.FC<WorldMapProps> = ({
  locations,
  startLocationName = "India",
  lineColor = "green",
  markerColor = "green",
  startMarkerColor = "red",
  textColor = "black",
  fontSize = 5,
  mapImage = "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg",
}) => {
  const startLocation = locations.find((loc) => loc.name === startLocationName);

  // Helper to create a curved path
  const createCurvePath = ([x1, y1]: number[], [x2, y2]: number[]) => {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2 - 20; // adjust curve height
    return `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;
  };

  return (
    <svg
      viewBox="0 0 360 180"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* World map background */}
      <image
        href={mapImage}
        x="0"
        y="0"
        className="w-full h-full object-scale-down"
      />

      {/* Curved dotted lines from startLocation */}
      {startLocation &&
        locations
          .filter((loc) => loc.name !== startLocationName)
          .map((loc, i) => {
            const start = project(
              startLocation.coordinates[0],
              startLocation.coordinates[1]
            );
            const end = project(loc.coordinates[0], loc.coordinates[1]);
            const path = createCurvePath(start, end);

            return (
              <path
                key={i}
                d={path}
                fill="none"
                stroke={lineColor}
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />
            );
          })}

      {/* Markers */}
      {locations.map((loc, i) => {
        const [x, y] = project(loc.coordinates[0], loc.coordinates[1]);
        const fillColor =
          loc.name === startLocationName ? startMarkerColor : markerColor;

        return (
          <g key={i}>
            <circle r={1.5} fill={fillColor} cx={x} cy={y} />
            <text
              x={x}
              y={y - 3}
              textAnchor="middle"
              fontSize={fontSize}
              fontFamily="system-ui"
              fill={textColor}
              className="font-bold"
            >
              {loc.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default WorldMap;
