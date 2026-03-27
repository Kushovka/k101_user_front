import { Outlet } from "react-router-dom";
import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";

const SidebarLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        {/* <Header /> */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default SidebarLayout;
