import { useSyncExternalStore } from "react";

const subscribe = (onStoreChange: () => void) => {
	onStoreChange();
	return () => {};
};

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useIsClient() {
	return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
