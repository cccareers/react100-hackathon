import "./App.css";
import WhereToWatchItem from "./WhereToWatchItem";

function WhereToWatchPanel({
  selectedResult,
  userSubscriptions,
  whereToWatch,
}) {
    const background = selectedResult.backdrop
      ? {
          backgroundImage: `linear-gradient(rgb(14, 12, 26), rgba(14, 12, 26, 0.35), rgba(14, 12, 26, 0.22), rgba(14, 12, 26, 0.88), rgb(14, 12, 26)), url(https://image.tmdb.org/t/p/w1280${selectedResult.backdrop})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          height: 500,
        }
      : { 
        backgroundImage: `linear-gradient(rgb(14, 12, 26), rgba(14, 12, 26, 0.35), rgba(14, 12, 26, 0.22), rgba(14, 12, 26, 0.88), rgb(14, 12, 26)), url(https://placehold.co/600x400/483d85/483d85)`,
        height: 500 };

  if (whereToWatch[0].service_name != "unavailable") {
    const included = whereToWatch
      .filter(
        (w) =>
          userSubscriptions.includes(w.service_name) &&
          (w.subscription_type === "subscription" || w.subscription_type === "addon"),
      )
      .map((w) => (
        <WhereToWatchItem
          key={whereToWatch.indexOf(w)}
          item={w}
        />
      ));

    const forPurchase = whereToWatch
      .filter(
        (w) =>
          userSubscriptions.includes(w.service_name) &&
          (w.subscription_type === "buy" || w.subscription_type === "rent"),
      )
      .map((w) => (
        <WhereToWatchItem
          key={whereToWatch.indexOf(w)}
          item={w}
        />
      ));

    const elsewhere = whereToWatch
      .filter((w) => !userSubscriptions.includes(w.service_name))
      .map((w) => (
        <WhereToWatchItem
          key={whereToWatch.indexOf(w)}
          item={w}
        />
      ));

    return (
      <div className="watch-panel">
        <div
          style={background}
          className="watch-panel-contents">
          <div className="watch-panel-header-area">
            <h2 className="where-to-watch-title">{selectedResult.title}</h2>
            {selectedResult.date && (
              <h2 className="watch-date">
                ({selectedResult.date.substring(0, 4)})
              </h2>
            )}
          </div>
          <div className="where-description-box">
            <p>{selectedResult.overview}</p>
          </div>

          <h3 className="wheretowatch-header">Where To Watch: </h3>
          <div className="included-items">
            {included.length > 0 ? (
              <div>
                Included with your subscriptions at: {included}
              </div>
            ) : (
              <>Sorry, not included for free with any of your subscriptions</>
            )}
          </div>
          <div className="purchaseable-items">
            {forPurchase.length > 0 ? (
              <div>Available for rent/purchase at: {forPurchase}</div>
            ) : (
              <>
                Not available for rent or puchase with any of your subscribed
                streaming services
              </>
            )}
          </div>
          {elsewhere.length > 0 && (
            <div className="elsewhere-items">
              <div>Available elsewhere with these services: {elsewhere}</div>
            </div>
          )}
        </div>
      </div>
    );
  } else {

    return (
      <div className="watch-panel">
        <div
          style={background}
          className="watch-panel-contents">
          <div className="watch-panel-header-area">
            <h2 className="where-to-watch-title">{selectedResult.title}</h2>
            {selectedResult.date && (
              <h2 className="watch-date">
                ({selectedResult.date.substring(0, 4)})
              </h2>
            )}
          </div>
          <div className="where-description-box">
            <p>{selectedResult.overview}</p>
          </div>
          <p>.</p>
            <div className="elsewhere-items">
              <div>Sorry, we were unable to find streaming information</div>
            </div>
        </div>
      </div>
    );
  }
}

export default WhereToWatchPanel;
