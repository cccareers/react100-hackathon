import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import SearchResultList from "./SearchResultList";
import ConfigPanel from "./ConfigPanel";
import WhereToWatchPanel from "./WhereToWatchPanel";
import {get, set} from 'idb-keyval';

const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;
const rapidapiKey = import.meta.env.VITE_STREAMING_AVAILABILITY_API_KEY;
tmdbKey ? console.log("TMPD API key is loaded") : console.log("Failed TMDB API key loading");
rapidapiKey ? console.log("Streaming Availability key is loaded") : console.log("Failed Streaming Availability key loading");

function App() {
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

 const [cache, setCache] = useState({});
 const [isLoaded, setIsLoaded] = useState(false);
useEffect(() => {
  const initCache = async () => {
    const saved = await get('streamingCache');
    if (saved) {
      setCache(saved);
    }
    setIsLoaded(true);
  };
  initCache();
}, []);
useEffect(() => {
  if (!isLoaded) return;
  const saveToDb = async () => {
    await set('streamingCache', cache);
  };
  saveToDb();
}, [cache, isLoaded]);

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
        Authorization:
          `Bearer ${tmdbKey}`,
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

  function findWhereToWatch(selectedItem, region) {
    if (cache[selectedItem.id] && Date.now() - cache[selectedItem.id].timestamp < 86400000) {
      console.log("retrieving from cache");
      if(cache[selectedItem.id].data.service_name !== "unavailable") {
        setSelectedResult(selectedItem);
        setWhereToWatch(cache[selectedItem.id].data);
        console.log("successfully retrieved from cache");
      } else {
        setSelectedResult(selectedItem);
        setWhereToWatch([{ service_name: "unavailable" }]);
        console.log(
          "Media ID previously found, but no data returned. streaming info unavailable",
        );
      }
    } else {
      if(cache[selectedItem.id] && Date.now() - cache[selectedItem.id].timestamp > 86400000)
        console.log("data is stale, refreshing");
      else
        console.log("data not in cache, querying Streaming Availability API");

      const options = {
        method: "GET",
        url: `https://streaming-availability.p.rapidapi.com/shows/${selectedItem.media_type}/${selectedItem.id}`,
        headers: {
          "x-rapidapi-key":
            rapidapiKey,
          "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      };

      axios
        .request(options)
        .then(function (res) {
          setSelectedResult(selectedItem);
          const foundData = res.data.streamingOptions[region].map((a) => ({
              service_name: a.service.name,
              subscription_type: a.type,
              link: a.link,
              quality: a.quality,
              price: a.price?.formatted,
              logo: a.service.imageSet.darkThemeImage,
              addon: a.addon?.name,
            }));
          setCache(prev => ({...prev, [selectedItem.id]: {data: foundData, timestamp: Date.now()}}));
          console.log("adding data to cache");
          setWhereToWatch(foundData);
          console.log(res.data);
        })
        .catch(function (err) {
          console.log("data not found, saving id in cache");
          setCache(prev => ({...prev, [selectedItem.id]: {data: {service_name: "unavailable"}, timestamp: Date.now()}}));
          setSelectedResult(selectedItem);
          setWhereToWatch([{ service_name: "unavailable" }]);
        });
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
