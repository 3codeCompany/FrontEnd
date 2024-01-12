// Hook
import { getPanelContext, IPanelContext, PanelContext } from "../PanelContext";
import { useContext, useState } from "react";

export function usePanelStorage<T>(key: string, initialValue: T): [T, (x: T) => any] {


    const subStoreKey = getPanelContext().routeData.routePath;
    const panelStorageKey = "frontend-panel-storage";
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const store: any = JSON.parse(window.localStorage.getItem(panelStorageKey));
            if (store === null || store[subStoreKey] === undefined || store[subStoreKey][key] === undefined) {
                return initialValue;
            }
            // Parse stored json or if none return initialValue
            return store[subStoreKey][key];
        } catch (error) {
            // If error also return initialValue
            console.log(error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            console.log(valueToStore);
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage

            let store: any = JSON.parse(window.localStorage.getItem(panelStorageKey));
            if (store === null) {
                store = {};
                store[subStoreKey] = {};
                store[subStoreKey][key] = valueToStore;
            } else {
                store[subStoreKey][key] = valueToStore;
            }
            window.localStorage.setItem(panelStorageKey, JSON.stringify(store));
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.log(error);
        }
    };

    return [storedValue, setValue];
}
