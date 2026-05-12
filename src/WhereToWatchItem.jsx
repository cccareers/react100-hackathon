import "./App.css";
import { useState, useEffect } from "react";

const WhereToWatchItem = ({ item }) => {
  const [linkTitle, setLinkTitle] = useState("Loading Version Info...");

  useEffect(() => {
    setLinkTitle("Loading Version Info...");

    async function getTitle() {
      const url = item.link;
      const endpoint = `/api/scrape?url=${encodeURIComponent(url)}`;

      try {
        const response = await fetch(endpoint);
        const titleData = await response.json();
        console.log(titleData);
        const title = titleData.title || "Unable to find version info";
        setLinkTitle(title.replaceAll("Watch ", ""));
      } catch (error) {
        console.error("Error:", error);
        setLinkTitle("Link");
      }
    }

    if (item.link) {
      getTitle();
    }
  }, [item.link]);

  return(
  <a
    className="wheretowatch-item"
    href={`${item.link}`}
    target="_blank">
    {item.quality && <span className="quality-tag">{(item.quality).toUpperCase()} quality</span>}
    {item.logo ? <img src={`${item.logo}`} /> : <h4>{item.service_name}</h4>}
    <p className="link-title">{linkTitle}</p>
    {item.subscription_type === "subscription" && (
      <p className="availability">No addons required</p>
    )}
    {item.subscription_type === "addon" && (
      <p className="availability">Available with {item.addon} addon</p>
    )}
    {(item.subscription_type === "buy" ||
      item.subscription_type === "rent") && (
      <p className="availability">
        Available to {item.subscription_type} {item.price && "for"} {item.price}
      </p>
    )}
  </a>);
};

export default WhereToWatchItem;
