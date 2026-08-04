import { useEffect, useMemo, useState } from "react";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";

const Plot = createPlotlyComponent(Plotly);

const DATA_URL =
  "/data/final_energy_cleaned.json";

const startTimeMapping = {
  HE24: "1 AM",
  HE10: "11 AM",
};

const forecastWindowLabels = {
  "1D": "One Day Ahead",
  "2D": "Two Day Ahead",
};

function getBufferedRange(values) {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const buffer = 0.05 * (maximum - minimum);

  return [minimum - buffer, maximum + buffer];
}

export default function LoadForecasterDashboard() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const [model, setModel] = useState("");
  const [startTime, setStartTime] = useState("");
  const [forecastWindow, setForecastWindow] = useState("");

  const [currentDay, setCurrentDay] = useState(0);
  const [currentHour, setCurrentHour] = useState(0);

  useEffect(() => {
    fetch(DATA_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status}`);
        }

        return response.json();
      })
      .then((rows) => {
        setData(rows);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const models = useMemo(() => {
    return [...new Set(data.map((row) => row.Model))].sort();
  }, [data]);

  const startTimes = useMemo(() => {
    return [...new Set(data.map((row) => row.StartHour))].sort();
  }, [data]);

  const forecastWindows = useMemo(() => {
    return [...new Set(data.map((row) => row.ForecastWindow))].sort();
  }, [data]);

  useEffect(() => {
    if (models.length > 0 && model === "") {
      setModel(models[0]);
    }
  }, [models, model]);

  useEffect(() => {
    if (startTimes.length > 0 && startTime === "") {
      setStartTime(
        startTimes.includes("HE24") ? "HE24" : startTimes[0]
      );
    }
  }, [startTimes, startTime]);

  useEffect(() => {
    if (forecastWindows.length > 0 && forecastWindow === "") {
      setForecastWindow(
        forecastWindows.includes("1D") ? "1D" : forecastWindows[0]
      );
    }
  }, [forecastWindows, forecastWindow]);

  const filteredData = useMemo(() => {
    if (
      data.length === 0 ||
      model === "" ||
      startTime === "" ||
      forecastWindow === ""
    ) {
      return [];
    }

    return data
      .filter(
        (row) =>
          row.Model === model &&
          row.StartHour === startTime &&
          row.ForecastWindow === forecastWindow
      )
      .sort((a, b) => {
        const dateDifference =
          new Date(a.Date).getTime() - new Date(b.Date).getTime();

        if (dateDifference !== 0) {
          return dateDifference;
        }

        return a.Hour - b.Hour;
      });
  }, [data, model, startTime, forecastWindow]);

  const dailyGroups = useMemo(() => {
    const groups = [];
    const rowsByDate = new Map();

    filteredData.forEach((row) => {
      if (!rowsByDate.has(row.Date)) {
        rowsByDate.set(row.Date, []);
      }

      rowsByDate.get(row.Date).push(row);
    });

    rowsByDate.forEach((rows) => {
      groups.push(rows);
    });

    return groups;
  }, [filteredData]);

  useEffect(() => {
    setCurrentDay(0);
    setCurrentHour(0);
  }, [model, startTime, forecastWindow]);

  const dayData = dailyGroups[currentDay] ?? [];

  useEffect(() => {
    if (dayData.length === 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentHour((previousHour) => {
        const finalHourIndex = dayData.length - 1;

        if (previousHour >= finalHourIndex) {
          setCurrentDay((previousDay) => {
            if (dailyGroups.length === 0) {
              return 0;
            }

            return (previousDay + 1) % dailyGroups.length;
          });

          return 0;
        }

        return previousHour + 1;
      });
    }, 150);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dayData.length, dailyGroups.length]);

  const globalLoadRange = useMemo(() => {
    if (data.length === 0) {
      return undefined;
    }

    const realizedValues = data.map((row) => row.Rlzd);

    return [
      Math.min(...realizedValues),
      Math.max(...realizedValues),
    ];
  }, [data]);

  const globalDayRange = useMemo(() => {
    if (data.length === 0) {
      return undefined;
    }

    return getBufferedRange(
      data.map((row) => row.DayEff * 100)
    );
  }, [data]);

  const globalTemperatureRange = useMemo(() => {
    if (data.length === 0) {
      return undefined;
    }

    return getBufferedRange(
      data.map((row) => row.TempEff * 100)
    );
  }, [data]);

  if (error) {
    return (
      <p style={{ padding: "20px" }}>
        Unable to load dashboard data: {error}
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p style={{ padding: "20px" }}>
        Loading dashboard data...
      </p>
    );
  }

  if (dayData.length === 0) {
    return (
      <p style={{ padding: "20px" }}>
        No matching dashboard data was found.
      </p>
    );
  }

  const safeHourIndex = Math.min(
    currentHour,
    dayData.length - 1
  );

  const hours = dayData.map((row) => row.Hour + 1);
  const forecast = dayData.map((row) => row.For_MR);
  const realized = dayData
    .slice(0, safeHourIndex + 1)
    .map((row) => row.Rlzd);
  const realizedHours = hours.slice(0, safeHourIndex + 1);

  const dayEffect = dayData.map((row) => row.DayEff * 100);
  const temperatureEffect = dayData.map(
    (row) => row.TempEff * 100
  );

  const dayRange =
    Math.min(...dayEffect) > -2 &&
    Math.max(...dayEffect) < 2
      ? [-2, 2]
      : globalDayRange;

  const temperatureRange =
    Math.min(...temperatureEffect) > -2 &&
    Math.max(...temperatureEffect) < 2
      ? [-2, 2]
      : globalTemperatureRange;

  const date = new Date(dayData[0].Date);

  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const restOfDate = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const graphConfig = {
    responsive: true,
    displaylogo: false,
  };

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          alignItems: "end",
          flexWrap: "wrap",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        <label>
          <div style={{ marginBottom: "6px" }}>Model</div>
          <select
            value={model}
            onChange={(event) => setModel(event.target.value)}
          >
            {models.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div style={{ marginBottom: "6px" }}>
            Starting Time
          </div>
          <select
            value={startTime}
            onChange={(event) =>
              setStartTime(event.target.value)
            }
          >
            {startTimes.map((value) => (
              <option key={value} value={value}>
                {startTimeMapping[value] ?? value}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div style={{ marginBottom: "6px" }}>
            Forecast Window
          </div>
          <select
            value={forecastWindow}
            onChange={(event) =>
              setForecastWindow(event.target.value)
            }
          >
            {forecastWindows.map((value) => (
              <option key={value} value={value}>
                {forecastWindowLabels[value] ?? value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 2fr) minmax(320px, 1fr)",
          gap: "12px",
          width: "100%",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            minWidth: 0,
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow:
              "2px 2px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Plot
            data={[
              {
                x: hours,
                y: forecast,
                type: "scatter",
                mode: "lines",
                name: "Forecast",
                line: {
                  color: "red",
                  width: 2,
                },
              },
              {
                x: realizedHours,
                y: realized,
                type: "scatter",
                mode: "lines",
                name: "Realized",
                line: {
                  color: "black",
                  width: 2,
                  dash: "dot",
                },
              },
            ]}
            layout={{
              title: {
                text:
                  `<b><span style="color:#1f77b4">${weekday}</span> ` +
                  `<span style="color:#6e6e6e">${restOfDate}</span></b>`,
                x: 0.5,
                xanchor: "center",
                font: {
                  size: 22,
                },
              },
              xaxis: {
                title: {
                  text: "Hour",
                },
                tickmode: "linear",
                dtick: 1,
                range: [1, 24],
              },
              yaxis: {
                title: {
                  text: "Load (MW)",
                },
                range: globalLoadRange,
              },
              legend: {
                orientation: "v",
                x: 0.01,
                y: 0.99,
                xanchor: "left",
                yanchor: "top",
                font: {
                  size: 16,
                },
                itemsizing: "trace",
              },
              hovermode: "x unified",
              autosize: true,
              margin: {
                l: 80,
                r: 30,
                t: 80,
                b: 60,
              },
              plot_bgcolor: "#f9f9f9",
              paper_bgcolor: "#ffffff",
            }}
            config={graphConfig}
            useResizeHandler={true}
            style={{
              width: "100%",
              height: "720px",
            }}
          />
        </div>

        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              boxShadow:
                "2px 2px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Plot
              data={[
                {
                  x: hours,
                  y: dayEffect,
                  type: "scatter",
                  mode: "lines",
                  line: {
                    width: 3,
                  },
                  showlegend: false,
                },
              ]}
              layout={{
                title: {
                  text: "Day Characteristic",
                  x: 0.5,
                  xanchor: "center",
                },
                xaxis: {
                  tickmode: "linear",
                  dtick: 2,
                  range: [1, 24],
                },
                yaxis: {
                  range: dayRange,
                  ticksuffix: "%",
                },
                autosize: true,
                margin: {
                  l: 60,
                  r: 20,
                  t: 60,
                  b: 45,
                },
                shapes: [
                  {
                    type: "line",
                    x0: 1,
                    x1: 24,
                    y0: 0,
                    y1: 0,
                    line: {
                      width: 1,
                    },
                  },
                ],
                plot_bgcolor: "#f9f9f9",
                paper_bgcolor: "#ffffff",
              }}
              config={graphConfig}
              useResizeHandler={true}
              style={{
                width: "100%",
                height: "350px",
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              boxShadow:
                "2px 2px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Plot
              data={[
                {
                  x: hours,
                  y: temperatureEffect,
                  type: "scatter",
                  mode: "lines",
                  line: {
                    width: 3,
                  },
                  showlegend: false,
                },
              ]}
              layout={{
                title: {
                  text: "Temperature Characteristic",
                  x: 0.5,
                  xanchor: "center",
                },
                xaxis: {
                  tickmode: "linear",
                  dtick: 2,
                  range: [1, 24],
                },
                yaxis: {
                  range: temperatureRange,
                  ticksuffix: "%",
                },
                autosize: true,
                margin: {
                  l: 60,
                  r: 20,
                  t: 60,
                  b: 45,
                },
                shapes: [
                  {
                    type: "line",
                    x0: 1,
                    x1: 24,
                    y0: 0,
                    y1: 0,
                    line: {
                      width: 1,
                    },
                  },
                ],
                plot_bgcolor: "#f9f9f9",
                paper_bgcolor: "#ffffff",
              }}
              config={graphConfig}
              useResizeHandler={true}
              style={{
                width: "100%",
                height: "350px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}