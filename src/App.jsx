import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import SearchResultList from "./SearchResultList";
import ConfigPanel from "./ConfigPanel";
import WhereToWatchPanel from "./WhereToWatchPanel";

const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;
tmdbKey
  ? console.log("TMPD API key is loaded")
  : console.log("Failed TMDB API key loading");

function App() {
  window.scrollTo(0, 0);
  //this userSubscriptions and useEffect section will save the user's
  // confirmed streaming services in local storage
  // so they don't have to re-enter their information
  // every time they revisit the site
  const [userSubscriptions, setUserSubscriptions] = useState(() => {
    const saved = localStorage.getItem("userSubscriptions");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem(
      "userSubscriptions",
      JSON.stringify(userSubscriptions),
    );
  }, [userSubscriptions]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState();
  const [whereToWatch, setWhereToWatch] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("us");

  function handleSearch() {
    const options = {
      method: "GET",
      url: "https://api.themoviedb.org/3/search/multi",
      params: {
        query: encodeURIComponent(searchTerm),
        include_adult: "false",
        language: "en-US",
        page: "1",
      },
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${tmdbKey}`,
      },
    };

    axios
      .request(options)
      .then(function (res) {
        setSearchResults(
          res.data.results
            .filter((a) => a.media_type === "tv" || a.media_type === "movie")
            .map((a) => ({
              title: a.title || a.name,
              id: a.id,
              overview: a.overview,
              media_type: a.media_type,
              date: a.release_date || a.first_air_date,
              backdrop: a.backdrop_path,
            })),
        );
        console.log(res.data.results);
      })
      .catch((err) => console.error(err));
  }

  async function getBackendStreamingData(type, id) {
    const endpoint = `http://localhost:3001/api/streaming-info?media_type=${type}&tmdbId=${id}`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }

  async function findWhereToWatch(selectedItem) {
    setSelectedResult(selectedItem);
    setWhereToWatch("loading");
    const region = selectedRegion;
    const streamingData = await getBackendStreamingData(
      selectedItem.media_type,
      selectedItem.id,
    );
    console.log("got this data on the frontend");
    console.log(streamingData);

    if (streamingData) {
      if (streamingData.data != "unavailable") {
        try {
          console.log("getting streaming data for region: " + region);
          const lastUpdate = new Date(streamingData.timestamp).toLocaleDateString();
          console.log("Timestamp "+ lastUpdate);
          const foundData = streamingData.data.streamingOptions[region].map(
            (a) => ({
              service_name: a.service.name,
              subscription_type: a.type,
              link: a.link,
              quality: a.quality,
              price: a.price?.formatted,
              logo: a.service.imageSet.darkThemeImage,
              addon: a.addon?.name,
              lastUpdated: lastUpdate,
            }),
          );
          setWhereToWatch(foundData);
          console.log("successfully retrieved data from backend request");
        } catch {
          console.log("data retrieved, but streaming info unavailable");
          setWhereToWatch([{ service_name: "unavailable" }]);
        }
      } else {
        console.log("id in cache, but request from Streaming Availability api returned nothing");
        setWhereToWatch([{ service_name: "unavailable" }]);
      }
    } else {
      console.log("failed to get data from backend");
      setWhereToWatch([{ service_name: "unavailable" }]);
    }
  }

  function handleSubscriptions(adding, subscription) {
    if (adding) setUserSubscriptions([...userSubscriptions, subscription]);
    else
      setUserSubscriptions(userSubscriptions.filter((s) => s !== subscription));
  }

  return (
    <>
      <h1>Where To Watch Movies and Shows</h1>
      <div className="content-panel">
        <ConfigPanel
          userSubscriptions={userSubscriptions}
          handleSubscriptions={handleSubscriptions}
          setRegion={setSelectedRegion}
        />

        <div className="search-panel">
          <div className="search-options">
            <input
              className="searchbar"
              placeholder="Find movies and shows"
              type="text"
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <button
              className="search-button"
              onClick={() => handleSearch()}>
              Search
            </button>
          </div>
          <SearchResultList
            results={searchResults}
            findWhereToWatch={findWhereToWatch}
          />
        </div>

        {selectedResult && (
          <WhereToWatchPanel
            selectedResult={selectedResult}
            userSubscriptions={userSubscriptions}
            whereToWatch={whereToWatch}
          />
        )}
      </div>
    </>
  );
}

export default App;
