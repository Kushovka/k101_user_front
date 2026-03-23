import clsx from "clsx";
import React from "react";
import Toast from "../../../components/toast/Toast";
import Loader from "../../../components/loader/Loader";
import { motion } from "framer-motion";
import { useSidebar } from "../../../components/sidebar/SidebarContext";
import {
  allPlans,
} from "../../../api/plans.api";
import type { PlanItem } from "../../../types/plans.types";
import type { AxiosError } from "axios";
import Plan from "../../../components/plan/Plan";



const Plans: React.FC = () => {
  const { isOpen } = useSidebar();

  const [plans, setPlans] = React.useState<PlanItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);


  const getPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await allPlans();
      setPlans(res.plans);
    } catch (err) {
      const error = err as AxiosError;
      setError(
        error.response?.status === 500 ? "Сервер ошибка" : "Ошибка загрузки",
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getPlans();
  }, []);

  return (
    <section
      className={clsx(
        "min-h-screen bg-slate-50 py-10 transition-all",
        isOpen ? "pl-[116px]" : "pl-[336px]",
      )}
    >
      <h1 className="text-[24px] font-medium tracking-tight text-slate-900">
        Все тарифные планы
      </h1>

      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}
      {loading && <Loader fullScreen />}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
          >
            <Plan
              name={plan.plan_name}
              price={plan.price}
              duration={plan.month}
              clicks={plan.clicks}
              archived={true}
              className="bg-cyan-50 border border-cyan-200"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Plans;
