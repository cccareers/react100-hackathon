import "./App.css";
import { useState } from "react";

function ConfigPanel({ userSubscriptions, handleSubscriptions }) {
const [configuring, setConfiguring] = useState(userSubscriptions.length === 0);

  return (
    <>
      {configuring ? (
        <div className="configuration-panel">
          <button
            className="hamburger"
            onClick={() => setConfiguring(false)}>
            &#9776;
          </button>
          <h2>Which of these streaming services do you have access to?</h2>
          <div className="service-selection">
            <div className="single-service-selection">
              <label>Netflix</label>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleSubscriptions(e.target.checked, "Netflix")
                }
                defaultChecked={userSubscriptions.includes("Netflix")}
              />
            </div>
            <div className="single-service-selection">
              <label>Prime Video</label>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleSubscriptions(e.target.checked, "Prime Video")
                }
                defaultChecked={userSubscriptions.includes("Prime Video")}
              />
            </div>
            <div className="single-service-selection">
              <label>Disney+</label>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleSubscriptions(e.target.checked, "Disney+")
                }
                defaultChecked={userSubscriptions.includes("Disney+")}
              />
            </div>
            <div className="single-service-selection">
              <label>Hulu</label>
              <input
                type="checkbox"
                onChange={(e) => handleSubscriptions(e.target.checked, "Hulu")}
                defaultChecked={userSubscriptions.includes("Hulu")}
              />
            </div>
            <div className="single-service-selection">
              <label>HBO Max</label>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleSubscriptions(e.target.checked, "HBO Max")
                }
                defaultChecked={userSubscriptions.includes("HBO Max")}
              />
            </div>
            <div className="single-service-selection">
              <label>Apple TV+</label>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleSubscriptions(e.target.checked, "Apple TV+")
                }
                defaultChecked={userSubscriptions.includes("Apple TV+")}
              />
            </div>
            <div className="single-service-selection">
              <label>Paramount+</label>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleSubscriptions(e.target.checked, "Paramount+")
                }
                defaultChecked={userSubscriptions.includes("Paramount+")}
              />
            </div>
            <div className="single-service-selection">
              <label>Crunchyroll</label>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleSubscriptions(e.target.checked, "Crunchyroll")
                }
                defaultChecked={userSubscriptions.includes("Crunchyroll")}
              />
            </div>
            <div className="single-service-selection">
              <label>Youtube Premium</label>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleSubscriptions(e.target.checked, "Youtube Premium")
                }
                defaultChecked={userSubscriptions.includes("Youtube Premium")}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="collapsed-config">
          <button
            className="hamburger"
            onClick={() => setConfiguring(true)}>
            &#9776;
          </button>
        </div>
      )}
    </>
  );
}

export default ConfigPanel;
