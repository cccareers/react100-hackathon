import "./App.css";

const WhereToWatchItem = ({ item }) => (
  <a
    className="wheretowatch-item"
    href={`${item.link}`}
    target="_blank"
    >
    {item.quality && <span className="quality-tag">{item.quality}</span>}
    {item.logo ? (<img 
        src={`${item.logo}`} 
    />) : (
    <h4>{item.service_name}</h4> )}
    {item.subscription_type === "subscription" && (<p className="availability">No addons required</p>)}
    {item.subscription_type === "addon" && (<p className="availability">Available with {item.addon} addon</p>)}
    {(item.subscription_type === "buy" || item.subscription_type === "rent") && (<p className="availability">Available to {item.subscription_type} {item.price &&("for")} {item.price}</p>)}
  </a>
);

export default WhereToWatchItem;
