import "./App.css";

const SearchResult = ({ result, findWhereToWatch }) => (
  <div
    className="selectable-search-item"
    onClick={function (e) {
      e.preventDefault();
      findWhereToWatch(result, "us");
      window.scrollTo(0, 0);
    }}>
    <div className="search-result-info">
      <h4>{result.title}</h4>
      <p className="result-media-type">{result.media_type === "tv" ? "Series" : "Movie"}</p>
      {result.date && (
      <p className="result-date">{result.date.substring(0, 4)}</p>
      )}
    </div>
    {result.overview && (
      <div className="result-description-box">
        <p>{result.overview.substring(0, 180)}{result.overview.length > 180 ? "..." : ""}</p>
      </div>
    )}
  </div>
);

export default SearchResult;
