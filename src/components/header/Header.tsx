import { FaUserSecret } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  console.log(user);
  return (
    <div className="fixed top-0 left-0 w-full bg-white z-30 shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between relative">
        {/* LEFT (можешь оставить пустым или потом что-то добавить) */}
        <div />

        {/* CENTER (логотип) */}
        <div className="absolute left-1/2 -translate-x-1/2 select-none">
          <span
            className="text-[30px] font-semibold tracking-tight text-slate-200
    [text-shadow:0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.08)]"
          >
            K101
          </span>
        </div>

        {/* RIGHT (юзер) */}
        <div className="flex items-center gap-6">
          <span className="text-sm text-slate-600">
            Баланс: <b className="text-slate-900">{user?.balance} ₽</b>
          </span>

          <div
            onClick={() => navigate("/account/profile")}
            className="group flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-slate-100 active:scale-[0.98] select-none"
          >
            <FaUserSecret className="w-5 h-5 text-slate-500 transition group-hover:text-slate-900" />

            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
              {user?.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
