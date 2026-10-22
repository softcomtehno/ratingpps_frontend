import { useEffect, useState } from "react";
import api from "../services/api";

/**
 * Хук для получения списка академических годов. У каждой организации свой
 * календарь: orgId берётся из страницы рейтинга, без него — годы организации
 * вошедшего пользователя.
 * Возвращает:
 *   years       — массив всех годов
 *   selectedYear — выбранный год (объект { id, name, isCurrent, isLocked })
 *   setSelectedYear — сеттер
 *   loading     — флаг загрузки
 */
export function useYears(orgId) {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(orgId ? `/api/organizations/${orgId}/years` : "/api/years")
      .then((resp) => {
        const data = resp.data || [];
        setYears(data);
        // По умолчанию выбираем текущий год, иначе первый в списке
        const current = data.find((y) => y.isCurrent) ?? data[0] ?? null;
        setSelectedYear(current);
      })
      .catch((e) => console.error("Ошибка загрузки годов:", e))
      .finally(() => setLoading(false));
  }, [orgId]);

  return { years, selectedYear, setSelectedYear, loading };
}
