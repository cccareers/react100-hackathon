import "./App.css";
import SearchResult from "./SearchResult";

function SearchResultList({ results, findWhereToWatch }) {
  return (
    <>
      {results.map((r) => (
        <SearchResult
          key={results.indexOf(r)}
          result={r}
          findWhereToWatch={findWhereToWatch}
        />
      ))}
    </>
  );
}

export default SearchResultList;
