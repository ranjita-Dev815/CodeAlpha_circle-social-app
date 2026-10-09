import { NavLink } from "react-router-dom";
import { GoHome, GoHomeFill } from "react-icons/go";
import { FiSearch, FiPlusSquare, FiUser } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { BsPlusSquareFill } from "react-icons/bs";
 
// username prop: logged-in user ka username (profile link ke liye)
export default function BottomNav({ username }) {
  const cls = ({ isActive }) => (isActive ? "nav-item active" : "nav-item");
 
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={cls} aria-label="Home">
        {({ isActive }) => (isActive ? <GoHomeFill /> : <GoHome />)}
      </NavLink>
 
      <NavLink to="/search" className={cls} aria-label="Search">
        {({ isActive }) => (isActive ? <IoSearch /> : <FiSearch />)}
      </NavLink>
 
      <NavLink to="/create" className={cls} aria-label="Create post">
        {({ isActive }) => (isActive ? <BsPlusSquareFill /> : <FiPlusSquare />)}
      </NavLink>
 
      <NavLink
        to={`/u/${encodeURIComponent(username || "")}`}
        className={cls}
        aria-label="Profile"
      >
        {({ isActive }) => (isActive ? <FaUser /> : <FiUser />)}
      </NavLink>
    </nav>
  );
}