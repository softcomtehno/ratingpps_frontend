import { useEffect, useState } from "react";
import api from "../services/api";

/**
 * Хук для получения списка академических годов.
 * Возвращает:
 *   years       — массив всех годов
 *   selectedYear — выбранный год (объект { id, name, isCurrent, isLocked })
 *   setSelectedYear — сеттер
 *   loading     — флаг загрузки
 */
export function useYears() {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/years")
      .then((resp) => {
        const data = resp.data || [];
        setYears(data);
        // По умолчанию выбираем текущий год, иначе первый в списке
        const current = data.find((y) => y.isCurrent) ?? data[0] ?? null;
        setSelectedYear(current);
      })
      .catch((e) => console.error("Ошибка загрузки годов:", e))
      .finally(() => setLoading(false));
  }, []);

  return { years, selectedYear, setSelectedYear, loading };
}
