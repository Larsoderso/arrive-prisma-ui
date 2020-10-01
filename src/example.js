import React, { useState, useEffect, useRef, PureComponent } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./style.css";
import MapGL, {
  LinearInterpolator,
  WebMercatorViewport,
  Marker,
  Source,
  StaticMap
} from "react-map-gl";
import bbox from "@turf/bbox";
import MAP_STYLE from "./map-style";
import "mapbox-gl/dist/mapbox-gl.css";
import DragableChartExample from "./components/charts/draggable_time-chart";
import axios from "axios";
import LoadingBar from "react-top-loading-bar";
import { Editor, DrawPolygonMode, EditingMode } from "react-map-gl-draw";
import DeckGL from "@deck.gl/react";
import { LineLayer } from "@deck.gl/layers";

const TOKEN =
  "pk.eyJ1IjoibGFyc2RpIiwiYSI6ImNrMXY1NzllOTAwZGYza3RrbWVpeDl1NTMifQ.iFu8GW4UGAtz9wtC3ILchA"; // Set your mapbox token here

// This site has 3 pages, all of which are rendered
// dynamically in the browser (not server rendered).
//
// Although the page does not ever refresh, notice how
// React Router keeps the URL up to date as you navigate
// through the site. This preserves the browser history,
// making sure things like the back button and bookmarks
// work properly.

class ParkMarkers extends PureComponent {
  render() {
    const { data } = this.props;
    console.log("data", data);
    return data.map((p) => (
      <Marker
        key={p.Properties.Name}
        longitude={p.Location.Coordinates[0]}
        latitude={p.Location.Coordinates[1]}
      >
        <svg
          width={40}
          height={40}
          viewBox="0 0 108 123"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M72.181 100.592C90.8058 93.3186 104 75.2002 104 54C104 26.3858 81.6142 4 54 4C26.3858 4 4 26.3858 4 54C4 75.524 17.6004 93.8715 36.6764 100.917L55 119L72.181 100.592Z"
              fill="white"
            />
          </g>
          <circle cx={54} cy={53} r={40} fill="#1A5FD0" />
          <defs>
            <filter
              id="filter0_d"
              x={0}
              y={0}
              width={108}
              height={123}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              />
              <feOffset />
              <feGaussianBlur stdDeviation={2} />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.11 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow"
                result="shape"
              />
            </filter>
          </defs>
        </svg>{" "}
      </Marker>
    ));
  }
}

class AmpMarkers extends PureComponent {
  render() {
    const { data } = this.props;
    console.log("data", data);
    return data.map((ampel) => (
      <Marker
        key={ampel.attributes.IDENTIFIER}
        longitude={ampel.geometry[0]}
        latitude={ampel.geometry[1]}
      >
        <svg
          width={40}
          height={40}
          viewBox="0 0 108 123"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M72.181 100.592C90.8058 93.3186 104 75.2002 104 54C104 26.3858 81.6142 4 54 4C26.3858 4 4 26.3858 4 54C4 75.524 17.6004 93.8715 36.6764 100.917L55 119L72.181 100.592Z"
              fill="white"
            />
          </g>
          <circle cx={54} cy={53} r={40} fill="#CC00FF" />
          <defs>
            <filter
              id="filter0_d"
              x={0}
              y={0}
              width={108}
              height={123}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              />
              <feOffset />
              <feGaussianBlur stdDeviation={2} />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.11 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow"
                result="shape"
              />
            </filter>
          </defs>
        </svg>{" "}
      </Marker>
    ));
  }
}

export default function BasicExample() {
  var map = {};
  useRef(() => {}, []);
  map = React.createRef();
  const [traffl, settraffl] = useState(undefined);
  const [loadingBarProgress, setloadingBarProgress] = useState(0);
  const [pg, setpg] = useState([]);
  const [mode, setMode] = useState(null);
  const [selectedFeatureIndex, setselectedFeatureIndex] = useState();

  const [selectedPanel, setSelectedPanel] = useState("LAYERS");
  useEffect(() => {
    axios
      .get(
        `https://raw.githubusercontent.com/Larsoderso/cgn-geojson/master/parking.json`
      )
      .then((res) => {
        const tl = res.data;
        console.log("tl", tl);
        //settraffl(tl.features);
      });
  }, []);

  const [viewport, setViewport] = useState({
    width: 400,
    height: 400,
    latitude: 50.921866,
    longitude: 6.959385,
    zoom: 14
  });
  function _updateViewport(viewportnew) {
    console.log(viewportnew);
    setViewport({ viewportnew });
  }

  function clearMarkers() {
    //setpg([]);
  }

  _onSelect = (options) => {
    setselectedFeatureIndex({
      selectedFeatureIndex: options && options.selectedFeatureIndex
    });
  };

  _onDelete = () => {
    const selectedIndex = selectedFeatureIndex;
    if (selectedIndex !== null && selectedIndex >= 0) {
      _editorRef.deleteFeatures(selectedIndex);
    }
  };

  _onUpdate = ({ editType, data }) => {
    console.log(editType);
    console.log("----FE----", data);

    if (editType === "addFeature") {
      getAreaData(data[0].geometry);
      setMode(new EditingMode());
      /** this.setState({
        mode: new EditingMode()
      });*/
    }
    if (editType === "movePosition") {
      getAreaData(data[0].geometry);
      setMode(new EditingMode());
      /** this.setState({
        mode: new EditingMode()
      });*/
    }
  };

  function getAreaData(data) {
    clearMarkers();
    axios.post(`http://localhost:8080/area/data`, { data }).then((res) => {
      console.log(res);
      console.log(res.data);
      setloadingBarProgress(100);
      if (res.data == null) {
      } else {
        setpg(res.data);
      }
    });
  }

  function renderDrawTools() {
    // copy from mapbox
    return (
      <div className="mapboxgl-ctrl-top-right">
        <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
          <button
            className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon"
            title="Polygon tool (p)"
            onClick={() => setMode(new DrawPolygonMode())}
          />
          <button
            className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
            title="Delete"
            onClick={this._onDelete}
          />
        </div>
      </div>
    );
  }

  function onLoaderFinished() {}
  function _onClick(event) {
    const feature = event.features[0];
    console.log("FEATURE", feature);

    setloadingBarProgress(60);
    getAreaData(feature.geometry);
    if (feature) {
      // calculate the bounding box of the feature
      const [minLng, minLat, maxLng, maxLat] = bbox(feature);
      // construct a viewport instance from the current state
      const viewport2 = new WebMercatorViewport(viewport);
      const { longitude, latitude, zoom } = viewport2.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat]
        ],
        {
          padding: 40
        }
      );

      setViewport({
        ...viewport,
        longitude,
        latitude,
        zoom,
        transitionInterpolator: new LinearInterpolator({
          around: [event.offsetCenter.x, event.offsetCenter.y]
        }),
        transitionDuration: 1000
      });
    }
  }
  const data = [
    {
      sourcePosition: [50.921866, 6.959385],
      targetPosition: [50.926, 6.96]
    }
  ];

  const layers = [new LineLayer({ id: "line-layer", data })];
  var viewportx = viewport;
  return (
    <Router>
      <div>
        <div
          className="am_blue_header"
          style={{
            background: "#ffffff",
            borderBottom: "1px solid rgb(246 246 246)",
            display: "flex",
            zIndex: 99
          }}
        >
          <svg
            width={55}
            height={57}
            viewBox="0 0 55 57"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ margin: "8px", width: "30px", height: "30px" }}
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M53.71 0.82901L28.4069 0.880832L28.512 1.2596L28.36 1.00003H27.5H26H25.1507L24.7138 1.72829L23.793 3.26284L22.5 1.00003H19L22.032 6.19782L20.3994 8.91892L16 1.00003H12.5L18.7363 11.6908L17.1345 14.3604L9.5 1.00003H6L15.4806 17.117L13.8397 19.8517L3 1.00003H0L12.2328 22.5298L12.2254 22.5423L12.3237 22.6898L12.5 23L12.5183 22.9817L12.7519 23.3321L13.7519 24.8321L14.1972 25.5H15H17.2143L15.5 28.5L17.5 31L20.7083 25.5H23.7222L19 34L20.5 37L27.2083 25.5H30.2143L22.5 39L24 42L33.7059 25.5H36.7125L25.5 45L27.5 47L39.7159 25.5H39.9271L40.3416 24.6709L40.8416 23.6709L41.2052 22.9438L40.7945 22.2423L39.7323 20.4276L42.6348 20.4145L44.3576 17.3679L37.9913 17.4534L36.3708 14.685L45.8343 14.7565L47.5571 11.7098L34.73 11.8821L33.1424 9.16994L49.0338 9.09844L50.7566 6.05181L31.5096 6.38052L29.8826 3.60105L52.2333 3.44041L53.71 0.82901ZM26.7433 4.17663L15.7746 22.4578L15.8028 22.5H37.4692L26.7433 4.17663Z"
              fill="#6868D3"
            />
          </svg>

          <svg
            width={36}
            height={31}
            viewBox="0 0 36 31"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "28px", padding: "8px", marginLeft: "auto" }}
          >
            <path
              d="M9 4L2 18.5V25.5L9 29L23 24.5L19.5 14.5H30L34.5 7L21.5 1.5L9 4Z"
              fill="#C4C4C4"
              fillOpacity="0.31"
              stroke="black"
              strokeDasharray="2 2"
            />
            <circle cx={9} cy={4} r="1.5" fill="white" stroke="black" />
            <circle cx={21} cy={2} r="1.5" fill="white" stroke="black" />
            <circle cx={2} cy={18} r="1.5" fill="white" stroke="black" />
            <circle cx={2} cy={25} r="1.5" fill="white" stroke="black" />
            <circle cx={10} cy={29} r="1.5" fill="white" stroke="black" />
            <circle cx={23} cy={24} r="1.5" fill="white" stroke="black" />
            <circle cx={20} cy={15} r="1.5" fill="white" stroke="black" />
            <circle cx={30} cy={14} r="1.5" fill="white" stroke="black" />
            <circle cx={34} cy={7} r="1.5" fill="white" stroke="black" />
          </svg>

          <button
            className="button transparent new-presentation"
            tabIndex={0}
            style={{
              height: "30px",
              display: "flex",
              background: "#ffffff00",
              border: "none",
              color: "#4F4FED",
              lineHeight: "24px",
              paddingTop: "12px",
              marginLeft: "auto",
              marginRight: "14px",
              fontWeight: "bold"
            }}
          >
            <div className="svg-icon plus-bold action">
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                style={{ fill: "#4F4FED" }}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 6a1 1 0 00-1 1v4H7a1 1 0 100 2h4v4a1 1 0 102 0v-4h4a1 1 0 100-2h-4V7a1 1 0 00-1-1z"
                />
              </svg>
            </div>
            New Analysis
          </button>
          <div
            style={{
              width: "50px" /* borderLeft: '1px solid #80808021', */,
              paddingRight: "12px"
            }}
          >
            <div
              style={{
                width: "35px",
                height: "35px",
                background: "#B5F1F5",
                borderRadius: "50%",
                margin: "6px"
              }}
            />
          </div>
        </div>
        <LoadingBar
          progress={loadingBarProgress}
          height={3}
          color="#00F464"
          onLoaderFinished={() => onLoaderFinished()}
        />

        {/** Header */}

        <div style={{ display: "flex", flexDirection: "row" }}>
          <div
            style={{
              width: "55px",
              height: "calc(100vw - 50px)",
              background: "rgb(255, 255, 255)",
              zIndex: 199,
              borderRight: "1px solid rgb(128 128 128 / 7%)",
              flexShrink: 0
            }}
          >
            <div
              style={{
                /* padding: '10px', */ textAlign: "center",
                paddingTop: "11px",
                paddingBottom: "4px"
              }}
              onClick={() => setSelectedPanel("LAYERS")}
            >
              <svg
                width={44}
                height={39}
                viewBox="0 0 44 39"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "28px", height: "30px" }}
              >
                <rect
                  width="24.4944"
                  height="24.4944"
                  rx={2}
                  transform="matrix(0.866044 -0.499967 0.866044 0.499967 0.786621 26.1068)"
                  fill="#4C5264"
                />
                <rect
                  width="24.4944"
                  height="24.4944"
                  rx={2}
                  transform="matrix(0.866044 -0.499967 0.866044 0.499967 1 19.2465)"
                  fill="#545B71"
                />
                <rect
                  width="24.4944"
                  height="24.4944"
                  rx={2}
                  transform="matrix(0.866044 -0.499967 0.866044 0.499967 1.21338 12.3861)"
                  fill="#5D657B"
                />
              </svg>
            </div>
            <div
              style={{
                /* padding: '10px', */ textAlign: "center",
                paddingTop: "5px",
                paddingBottom: "11px"
              }}
              onClick={() => setSelectedPanel("DATACAT")}
            >
              <svg
                width={30}
                height={37}
                viewBox="0 0 30 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "26px", height: "26px" }}
              >
                <path
                  d="M1 27.4545V10.9091L15 2L29 10.9091V27.4545L15 35.0909L1 27.4545Z"
                  stroke="#4C5264"
                  strokeWidth="1.7"
                />
                <path
                  d="M6.0918 13.454L15.0009 18.5449L23.91 13.454"
                  stroke="#4C5264"
                  strokeWidth="1.7"
                />
                <path
                  d="M15 18.546V27.4551"
                  stroke="#4C5264"
                  strokeWidth="1.7"
                />
              </svg>
            </div>

            <div
              style={{
                textAlign: "center",
                paddingTop: "5px",
                paddingBottom: "11px"
              }}
            >
              <svg
                width={151}
                height={164}
                viewBox="0 0 151 164"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "25px", height: "27px" }}
              >
                <path
                  d="M99.325 54.825C83.65 64.025 27.875 58.975 34.525 23.975C38.625 2.45001 86.325 -16.075 127.975 34.475C127.975 34.475 146.4 35.725 148.975 51.625C150.625 61.825 144.7 69.075 144.7 69.075C144.7 69.075 153.975 78.65 143.05 82.825"
                  stroke="#3B3858"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M129.6 22.025C131.375 27.9 128 34.475 128 34.475L136.725 31.275"
                  stroke="#3B3858"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M88.4 96.175L114.675 83.4"
                  stroke="#64E5F9"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M97.825 125.4L130.575 120.525"
                  stroke="#64E5F9"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M79.5 142.2C79.5 142.2 80.475 155.125 79.825 159.75"
                  stroke="#3B3858"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M48.925 52.075C48.925 52.075 42.675 77.5 47.5 94.65"
                  stroke="#3B3858"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M62.2 73.475L60.325 82.525"
                  stroke="#3B3858"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M38.7 43.7C27.375 47.375 25.225 64.325 40.3 66C40.3 66 36.3 73.5 45.775 73.5"
                  stroke="#3B3858"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M122.2 81.725C123.475 78.925 126.05 77 129.025 77C133.275 77 136.7 80.875 136.7 85.65C136.7 89.2 134.8 92.25 132.1 93.575"
                  stroke="#3B3858"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M59.025 83.4C53.075 83.65 40.475 100.95 40.475 119.625C40.475 138.3 54.225 144.875 67.95 144.875C85.975 144.875 97.825 125.4 97.825 125.4L88.4 96.175C73.225 93.925 66.1 83.125 59.025 83.4Z"
                  fill="#64E5F9"
                  stroke="#64E5F9"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M58.9822 135.102C62.8533 133.15 63.9154 127.45 61.3544 122.371C58.7935 117.292 53.5792 114.757 49.7081 116.708C45.837 118.66 44.7749 124.36 47.3359 129.439C49.8969 134.519 55.1111 137.054 58.9822 135.102Z"
                  stroke="#3B3858"
                  strokeWidth="2.99993"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M91.65 57.625C91.65 57.625 92.575 79.875 106.65 74C106.65 74 105.225 83.425 114.7 83.425"
                  stroke="#3B3858"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M115.425 90.825C114.95 89.225 114.7 87.5 114.7 85.7C114.7 76.8 121.1 69.575 129 69.575C136.9 69.575 143.3 76.8 143.3 85.7C143.3 94.6 136.9 101.825 129 101.825C127.25 101.825 125.55 101.475 124 100.8"
                  stroke="#3B3858"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M130.7 101.825C130.7 101.825 129.075 133.075 138.5 157.65"
                  stroke="#3B3858"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M51.225 81.1C52.9371 81.1 54.325 79.7121 54.325 78C54.325 76.2879 52.9371 74.9 51.225 74.9C49.5129 74.9 48.125 76.2879 48.125 78C48.125 79.7121 49.5129 81.1 51.225 81.1Z"
                  fill="#3B3858"
                />
                <path
                  d="M83.025 83.65C84.9718 83.65 86.55 82.0718 86.55 80.125C86.55 78.1782 84.9718 76.6 83.025 76.6C81.0782 76.6 79.5 78.1782 79.5 80.125C79.5 82.0718 81.0782 83.65 83.025 83.65Z"
                  fill="#3B3858"
                />
                <path
                  d="M17.575 131.9C16.25 130.975 14.5 130.7 12.875 131.325C10.275 132.325 8.97501 135.225 9.97501 137.825C10.975 140.425 14.025 141.725 17.55 141.325C25.25 140.475 34.4 133.825 34.4 133.825"
                  stroke="#64E5F9"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.62501 145.9C2.87501 146.95 1.50001 150.05 2.57501 152.775C3.65001 155.5 6.85001 156.825 10.6 156.475C25 155.15 38.2 140 38.2 140"
                  stroke="#64E5F9"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M42.25 157.65C42.625 158.725 42.5 159.95 41.775 160.925C40.625 162.5 38.425 162.85 36.85 161.7C35.275 160.55 34.95 158.25 35.875 155.925C37.875 150.875 44.025 145.9 44.025 145.9"
                  stroke="#64E5F9"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div
            style={{
              width: "420px",
              height: "calc(100vw - 50px)",
              flexShrink: 0,
              background: "white",
              zIndex: 99,
              boxShadow: "rgba(0, 0, 0, 0.19) 0px 4px 4px"
            }}
          >
            {selectedPanel == "DETAIL" && (
              <div
                style={{
                  width: "100%",
                  height: "35px",
                  background: "white",
                  borderBottom: "1px solid #24242414",
                  color: "#e2e0e0"
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-arrow-left"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ height: "35px", marginLeft: "12px" }}
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <line x1={5} y1={12} x2={19} y2={12} />
                  <line x1={5} y1={12} x2={11} y2={18} />
                  <line x1={5} y1={12} x2={11} y2={6} />
                </svg>
              </div>
            )}
            {selectedPanel == "DATACAT" && (
              <div style={{ height: "100%" }}>
                <div
                  style={{
                    width: "100%",
                    height: "35px",
                    background: "white",
                    borderBottom: "1px solid rgb(36 36 36 / 7%)",
                    color: "rgb(226, 224, 224)",
                    lineHeight: "35px",
                    display: "flex"
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-search"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      width: "16px",
                      height: "16px",
                      marginTop: "10px",
                      marginLeft: "6px"
                    }}
                  >
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <circle cx={10} cy={10} r={7} />
                    <line x1={21} y1={21} x2={15} y2={15} />
                  </svg>
                  <input
                    type="text"
                    style={{
                      height: "35px",
                      width: "100%",
                      boxSizing: "border-box",
                      marginTop: 0,
                      marginLeft: "10px",
                      borderRadius: 0,
                      borderColor: "transparent"
                    }}
                  />
                </div>
                <div
                  style={{
                    background: "#fafafc",
                    height: "100%",
                    padding: "8px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      paddingLeft: "12px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      fontFamily: "sans-serif",
                      background: "rgb(255 255 255)",
                      /* borderLeft: '4px solid rgb(242, 29, 216)', */ boxShadow:
                        "0px 0px 4px rgb(0 0 0 / 3%)",
                      height: "84px",
                      borderRadius: "4px"
                    }}
                  >
                    <div style={{ color: "rgb(103, 100, 100)" }}>
                      {" "}
                      Stadtteile Köln{" "}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPanel == "LAYERS" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    paddingLeft: "12px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    fontFamily: "sans-serif",
                    marginLeft: "12px",
                    marginRight: "12px",
                    background: "rgb(249 249 249)",
                    borderLeft: "4px solid #f21dd8",
                    marginTop: "12px"
                  }}
                >
                  <div style={{ color: "#676464" }}> Stadtteile Köln </div>
                </div>
                <div
                  style={{
                    WebkitBoxAlign: "center",
                    alignItems: "center",
                    backgroundColor: "rgb(15, 150, 104)",
                    borderRadius: "4px",
                    color: "rgb(255, 255, 255)",
                    cursor: "pointer",
                    display: "inline-flex",
                    fontSize: "11px",
                    fontWeight: 500,
                    fontFamily:
                      'ff-clan-web-pro, "Helvetica Neue", Helvetica, sans-serif',
                    WebkitBoxPack: "center",
                    justifyContent: "center",
                    letterSpacing: "0.3px",
                    lineHeight: "14px",
                    outline: "0px",
                    padding: "9px 12px",
                    textAlign: "center",
                    transition: "all 0.4s ease 0s",
                    verticalAlign: "middle",
                    width: "125px",
                    opacity: 1,
                    pointerEvents: "all",
                    border: "0px",
                    marginTop: "18px",
                    marginLeft: "12px"
                  }}
                >
                  <svg
                    viewBox="0 0 64 64"
                    width="12px"
                    height="12px"
                    className="data-ex-icons-add "
                    style={{ fill: "currentcolor", marginRight: "8px" }}
                  >
                    <path d="M35.93,28.57V9.89a1,1,0,0,0-1-1h-5.9a1,1,0,0,0-1,1V28.57H9.39a1,1,0,0,0-1,1v5.9a1,1,0,0,0,1,1H28.07V55.11a1,1,0,0,0,1,1h5.9a1,1,0,0,0,1-1V36.43H54.61a1,1,0,0,0,1-1v-5.9a1,1,0,0,0-1-1Z" />
                  </svg>{" "}
                  Ebene hinzufügen
                </div>
                <div
                  style={{
                    color: "rgb(255 255 255)",
                    padding: "12px 12px 0px",
                    fontFamily: "sans-serif",
                    fontWeight: 400
                  }}
                >
                  Prediction
                </div>
                <div style={{ padding: 12, boxSizing: "border-box" }}>
                  <DragableChartExample />
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "78px",
                    padding: "12px",
                    boxSizing: "border-box"
                  }}
                ></div>
                <div
                  style={{
                    width: "100%",
                    height: "78px",
                    padding: "12px",
                    boxSizing: "border-box"
                  }}
                ></div>
              </div>
            )}
          </div>
          <div style={{ height: "calc(100vh - 80px)", overflow: "hidden" }}>
            <DeckGL
              initialViewState={viewportx}
              controller={true}
              layers={layers}
            >
              <StaticMap mapboxApiAccessToken={TOKEN} />

              <MapGL
                ref={map}
                mapStyle={MAP_STYLE}
                interactiveLayerIds={["sf-neighborhoods-fill"]}
                {...viewportx}
                width="calc(100vh - 80px)"
                height="calc(100vw - 500px)"
                onClick={(e) => console.log(e)}
                onViewportChange={(nextViewport) => setViewport(nextViewport)}
                mapboxApiAccessToken={TOKEN}
              >
                <Editor
                  ref={(_) => (_editorRef = _)}
                  style={{ width: "100%", height: "100%" }}
                  clickRadius={12}
                  mode={mode}
                  onSelect={_onSelect}
                  onUpdate={_onUpdate}
                  editHandleShape={"circle"}
                />
                {renderDrawTools()}

                <Marker
                  latitude={50.921866}
                  longitude={6.959385}
                  offsetLeft={-20}
                  offsetTop={-40}
                >
                  <svg
                    width={40}
                    height={40}
                    viewBox="0 0 108 123"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g filter="url(#filter0_d)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M72.181 100.592C90.8058 93.3186 104 75.2002 104 54C104 26.3858 81.6142 4 54 4C26.3858 4 4 26.3858 4 54C4 75.524 17.6004 93.8715 36.6764 100.917L55 119L72.181 100.592Z"
                        fill="white"
                      />
                    </g>
                    <circle cx={54} cy={53} r={40} fill="#1A5FD0" />
                    <defs>
                      <filter
                        id="filter0_d"
                        x={0}
                        y={0}
                        width={108}
                        height={123}
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity={0} result="BackgroundImageFix" />
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        />
                        <feOffset />
                        <feGaussianBlur stdDeviation={2} />
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.11 0"
                        />
                        <feBlend
                          mode="normal"
                          in2="BackgroundImageFix"
                          result="effect1_dropShadow"
                        />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="effect1_dropShadow"
                          result="shape"
                        />
                      </filter>
                    </defs>
                  </svg>{" "}
                </Marker>
              </MapGL>
            </DeckGL>
          </div>

          {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/dashboard">
              <Dashboard />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

// You can think of these components as "pages"
// in your app.

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}

function About() {
  return (
    <div>
      <h2>About</h2>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
    </div>
  );
}
