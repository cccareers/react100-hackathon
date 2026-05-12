import "./App.css";
import { useState } from "react";

function ConfigPanel({ userSubscriptions, handleSubscriptions, setRegion }) {
  const [configuring, setConfiguring] = useState(
    userSubscriptions.length === 0,
  );

  return (
    <>
      {configuring ? (
        <div className="configuration-panel">
          <button
            className="hamburger"
            onClick={() => setConfiguring(false)}>
            &#9776;
          </button>
          <div className="region-div">
            Primary Region:  
            <select
              className="region-select"
              onChange={(e) => setRegion(e.target.value)}>
              <option value="us">United States</option>
              <option value="gb">Great Britain</option>
              <option value="at">Austria</option>
              <option value="au">Australia</option>
              <option value="be">Belgium</option>
              <option value="br">Brazil</option>
              <option value="ca">Canada</option>
              <option value="ch">Switzerland</option>
              <option value="cl">Chile</option>
              <option value="co">Colombia</option>
              <option value="cz">Czechia</option>
              <option value="de">Germany</option>
              <option value="dk">Denmark</option>
              <option value="es">Spain</option>
              <option value="fi">Finland</option>
              <option value="fr">France</option>
              <option value="gr">Greece</option>
              <option value="hk">Hong Kong</option>
              <option value="id">Indonesia</option>
              <option value="ie">Ireland</option>
              <option value="il">Israel</option>
              <option value="it">Italy</option>
              <option value="md">Moldova</option>
              <option value="mx">Mexico</option>
              <option value="my">Malaysia</option>
              <option value="nl">Netherlands</option>
              <option value="no">Norway</option>
              <option value="ph">Philippines</option>
              <option value="pt">Portugal</option>
              <option value="ro">Romania</option>
              <option value="se">Sweden</option>
              <option value="sg">Singapore</option>
              <option value="th">Thailand</option>
              <option value="ua">Ukraine</option>
              <option value="ve">Venezuela</option>
              <option value="za">South Africa</option>
            </select>
          </div>
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
