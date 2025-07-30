import { sharedState, broadcast } from "../index.js";
export const changeState = (newState) => {
    console.log("Changing state to:", newState);
    sharedState.type = newState.type;
    sharedState.counter =  newState.counter || 0;
    sharedState.totalCounter = newState.totalCounter || 0;
    sharedState.message = newState.message || "";
    sharedState.data = newState.data || {};
    broadcast({ type: "stateUpdate", state: sharedState });
}