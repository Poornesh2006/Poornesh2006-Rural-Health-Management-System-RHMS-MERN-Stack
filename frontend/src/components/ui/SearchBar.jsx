import { FiSearch } from "react-icons/fi";
import { Input } from "./Input";

export function SearchBar({ placeholder = "Search...", className }) {
  return (
    <div className={className}>
      <Input icon={FiSearch} placeholder={placeholder} type="search" />
    </div>
  );
}
