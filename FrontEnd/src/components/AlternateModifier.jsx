import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AlternateModifier.css";
const AlternateModifier = (props) => {
  const [components, setComponents] = useState([]);
  const [selectedComponentIds, setSelectedComponentIds] = useState([]);
  const [alternateComponents, setAlternateComponents] = useState({});
  const [selectedAlternateComponentIds, setSelectedAlternateComponentIds] =
    useState({});
  

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/vehicles/config/${props.selectedId}/Y`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setComponents(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchComponents();
  }, []);

  const handleCheckboxChange = async (compId, checked) => {
    if (checked) {
      setSelectedComponentIds((prevIds) => [...prevIds, compId]);
      try {
        const response = await fetch(
          `http://localhost:8080/api/alternate-components/${props.selectedId}/${compId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch alternate components");
        }
        const data = await response.json();
        setAlternateComponents((prevState) => ({
          ...prevState,
          [compId]: data,
        }));
        setSelectedAlternateComponentIds((prevState) => ({
          ...prevState,
          [compId]: selectedAlternateComponentIds[compId] || "", // Set the previously selected option when checkbox is checked
        }));
      } catch (error) {
        console.error("Error fetching alternate components:", error);
      }
    } else {
      setSelectedComponentIds((prevIds) =>
        prevIds.filter((id) => id !== compId)
      );
      setAlternateComponents((prevState) => {
        const newState = { ...prevState };
        delete newState[compId];
        return newState;
      });
      setSelectedAlternateComponentIds((prevState) => {
        const newState = { ...prevState };
        delete newState[compId];
        return newState;
      });
    }
  };

  const navigate = useNavigate();
  const selectedDropdownIds = Object.values(selectedAlternateComponentIds);
  const nonCheckedComponentIds = components
    .filter((component) => !selectedComponentIds.includes(component.comp_id))
    .map((component) => component.comp_id);

  const handleInvoiceClick = () => {
    //alert(totalDeltaPrice);
    navigate("/InvoiceGenerator", {
      state: {
        nonCheckedComponentIds: nonCheckedComponentIds,
        selectedDropdownIds: selectedDropdownIds,
        selectedId: props.selectedId,
        orderSize: props.orderSize,
        // totalDeltaPrice: totalDeltaPrice,
      },
    });
  };

  const handleAlternateChange = (compId, selectedValue) => {
    setSelectedAlternateComponentIds((prevState) => ({
      ...prevState,
      [compId]: selectedValue,
    }));
  };
  

  return (
    <div>
      <h1>Components List</h1>
      <ul>
        {components.map((component, index) => (
          <li key={index}>
            <input
              type="checkbox"
              checked={selectedComponentIds.includes(component.comp_id)}
              onChange={(e) =>
                handleCheckboxChange(component.comp_id, e.target.checked)
              }
            />
            {component.comp_name}
            {selectedComponentIds.includes(component.comp_id) && (
              <select
                value={selectedAlternateComponentIds[component.comp_id] || ""}
                onChange={(e) =>
                  handleAlternateChange(component.comp_id, e.target.value)
                }
                disabled={!selectedComponentIds.includes(component.comp_id)}
              >
                <option value="">Select Alternate Component</option>
                {console.log(alternateComponents)}
                {alternateComponents[component.comp_id] &&
                  alternateComponents[component.comp_id].map(
                    (alternateComponent, index) => (
                      <option key={index} value={alternateComponent.id}>
                        {alternateComponent.comp_name} (Delta Price:{" "}
                        {alternateComponent.delta_price})
                      </option>
                    )
                  )}
              </select>
            )}
          </li>
        ))}
      </ul>
      <button onClick={handleInvoiceClick}>Generate Invoice</button>
    </div>
  );
};

export default AlternateModifier;
