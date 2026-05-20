import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar";
import YearSelector from "../../components/YearSelector";
import { useYears } from "../../hooks/useYears";
import api from "../../services/api";
import "../../css/Rating.css";

export default function InstituteRating() {
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(true);

    const { years, selectedYear, setSelectedYear, loading: yearsLoading } = useYears();

    useEffect(() => {
        if (yearsLoading) return;
        setLoading(true);
        const params = selectedYear ? { yearId: selectedYear.id } : {};
        api.get("/api/rating/institutes", { params })
            .then(response => setInstitutes(response.data.institutes ?? []))
            .catch(error => console.error("Error fetching institute ratings:", error))
            .finally(() => setLoading(false));
    }, [selectedYear, yearsLoading]);

    // Группируем институты по организации
    const grouped = useMemo(() => {
        const map = {};
        institutes.forEach(inst => {
            const org = inst.organization || "Без организации";
            if (!map[org]) map[org] = [];
            map[org].push(inst);
        });
        // Сортируем каждую группу по баллам
        Object.values(map).forEach(arr => arr.sort((a, b) => b.points - a.points));
        return map;
    }, [institutes]);

    return (
        <div className="home-content">
            <header className="header">
                <NavBar />
            </header>
            <main className="main max-main">
                <h2 className="title">Рейтинг Институтов</h2>

                <YearSelector
                    years={years}
                    selectedYear={selectedYear}
                    onChange={setSelectedYear}
                    loading={yearsLoading}
                />

                {loading ? (
                    <div className="loading" style={{ textAlign: "center", padding: "40px" }}>
                        Загрузка...
                    </div>
                ) : institutes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                        Нет данных
                    </div>
                ) : (
                    Object.entries(grouped).map(([orgName, orgInstitutes]) => (
                        <div key={orgName} style={{ marginBottom: "32px" }}>
                            <h3 style={{ marginBottom: "12px", color: "#333" }}>
                                🏛️ {orgName}
                            </h3>
                            <div className="table-responsive">
                                <table className="user-table">
                                    <thead>
                                        <tr>
                                            <th className="table-header">Позиция</th>
                                            <th className="table-header">Название Института</th>
                                            <th className="table-header">Количество ППС</th>
                                            <th className="table-header">Баллы экспертов</th>
                                            <th className="table-header">Сумма баллов</th>
                                            <th className="table-header">Средний балл</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orgInstitutes.map((inst, index) => (
                                            <tr key={inst.id} className="table-row">
                                                <td className="table-data font-semibold text-center">{index + 1}</td>
                                                <td className="table-data">{inst.name}</td>
                                                <td className="table-data text-center">{inst.teacherTotal ?? 0}</td>
                                                <td className="table-data text-center">{inst.expertPoints ?? 0}</td>
                                                <td className="table-data font-bold text-center text-blue-600">{inst.points}</td>
                                                <td className="table-data font-bold text-center text-blue-600">
                                                    {inst.teacherTotal > 0 ? (inst.points / inst.teacherTotal).toFixed(2) : "0"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
