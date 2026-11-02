// Holds the Japan listing you tapped, so the detail sheet can show it
// without re-fetching. (Fine for a prototype; a real app would cache by id.)
import type { JapanListing } from './finder-japan';

let selected: JapanListing | null = null;
export const setJapanSelection = (l: JapanListing) => { selected = l; };
export const getJapanSelection = () => selected;
