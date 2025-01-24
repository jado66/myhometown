"use client";
import { Box, Container } from "@mui/material";
import React, { useState } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

const ProjectTimelineManager = () => {
  const [tooltipContent, setTooltipContent] = useState(null);

  // Sample project data
  const projects = [
    {
      name: "Project A",
      segments: [
        {
          name: "Planning",
          start: new Date("2025-01-01"),
          end: new Date("2025-01-15"),
          completion: 100,
        },
        {
          name: "Development",
          start: new Date("2025-01-16"),
          end: new Date("2025-03-15"),
          completion: 60,
        },
        {
          name: "Testing",
          start: new Date("2025-03-16"),
          end: new Date("2025-03-31"),
          completion: 20,
        },
      ],
    },
    {
      name: "Project B",
      segments: [
        {
          name: "Research",
          start: new Date("2025-02-01"),
          end: new Date("2025-02-28"),
          completion: 100,
        },
        {
          name: "Implementation",
          start: new Date("2025-03-01"),
          end: new Date("2025-04-15"),
          completion: 40,
        },
        {
          name: "Review",
          start: new Date("2025-04-16"),
          end: new Date("2025-04-30"),
          completion: 0,
        },
      ],
    },
  ];

  // Process data for Recharts
  const processData = () => {
    const startDate = new Date(
      Math.min(...projects.flatMap((p) => p.segments.map((s) => s.start)))
    );
    const endDate = new Date(
      Math.max(...projects.flatMap((p) => p.segments.map((s) => s.end)))
    );

    return projects.map((project) => {
      const data = {
        name: project.name,
        segments: project.segments.map((segment) => ({
          ...segment,
          startPosition: (segment.start - startDate) / (1000 * 60 * 60 * 24),
          duration: (segment.end - segment.start) / (1000 * 60 * 60 * 24),
        })),
      };
      return data;
    });
  };

  const data = processData();

  const getSegmentColor = (completion) => {
    if (completion === 100) return "#4CAF50";
    if (completion >= 60) return "#8BC34A";
    if (completion >= 30) return "#FFC107";
    return "#FF5722";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const segment = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-medium text-gray-900">{segment.name}</p>
        <p className="text-sm text-gray-600">Progress: {segment.completion}%</p>
        <p className="text-sm text-gray-600">
          {segment?.start?.toLocaleDateString()} -{" "}
          {segment?.end?.toLocaleDateString()}
        </p>
      </div>
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={4}
      mx="auto"
    >
      {" "}
      <ResponsiveContainer>
        <ComposedChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <XAxis
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => {
              const date = new Date(data[0].segments[0].start);
              date.setDate(date.getDate() + value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
          />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {data.map((project, projectIndex) =>
            project.segments.map((segment, segmentIndex) => (
              <Bar
                key={`${projectIndex}-${segmentIndex}`}
                dataKey={`segments[${segmentIndex}].duration`}
                stackId={projectIndex}
                name={segment.name}
                fill={getSegmentColor(segment.completion)}
                radius={[4, 4, 4, 4]}
              >
                <Cell />
              </Bar>
            ))
          )}
        </ComposedChart>
      </ResponsiveContainer>
      {/* Legend */}
      {/* <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
            <span className="text-sm">Complete (100%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-lime-500 mr-2"></div>
            <span className="text-sm">Near Complete (≥60%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-yellow-500 mr-2"></div>
            <span className="text-sm">In Progress (≥30%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
            <span className="text-sm">Started (<30%)</span>
          </div>
        </div>
      </div> */}
    </Box>
  );
};

export default ProjectTimelineManager;
