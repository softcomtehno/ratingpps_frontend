import { useEffect, useState, useCallback } from "react";
import api from '../../../services/api';
import NavBar from "../../../components/NavBar";
import useAuthToken from "../../../hooks/useAuthToken";
import "../../../css/AdminDirectors.css";

export default function AdminDirectors() {
    const token = useAuthToken();

    // Directors list from /api/director
    const [directors, setDirectors] = useState([]);
    const [loadingDirectors, setLoadingDirectors] = useState(true);

    // All institutes from /api/institute (for the add modal dropdown)
    const [institutes, setInstitutes] = useState([]);

    // All teachers list from /api/teacher
    const [teachers, setTeachers] = useState([]);

    // Add director modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedInstituteId, setSelectedInstituteId] = useState("");
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");
    const [addSuccess, setAddSuccess] = useState("");

    // Delete state
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState("");

    const fetchDirectors = useCallback(() => {
        setLoadingDirectors(true);
        api
            .get("/api/director")
            .then((res) => setDirectors(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error(err))
            .finally(() => setLoadingDirectors(false));
    }, []);

    useEffect(() => {
        fetchDirectors();

        // Load all institutes for the modal dropdown
        api
            .get("/api/institute")
            .then((res) => setInstitutes(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error(err));

        // Load teachers
        api
            .get("/api/teacher")
            .then((res) => setTeachers(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error(err));
    }, [fetchDirectors]);

    // Group directors by institute (from /api/director response)
    const byInstitute = directors.reduce((acc, director) => {
        const key = director.instituteId ?? director.institute?.id ?? "unknown";
        const label =
            director.instituteName ??
            director.institute?.name ??
            `Институт ${key}`;
        if (!acc[key]) acc[key] = { id: key, name: label, directors: [] };
        acc[key].directors.push(director);
        return acc;
    }, {});

    const instituteGroups = Object.values(byInstitute);

    // Open modal (optionally pre-select an institute)
    const openAddModal = (instId = "") => {
        setSelectedInstituteId(String(instId));
        setSelectedTeacherId("");
        setAddError("");
        setAddSuccess("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedInstituteId("");
        setSelectedTeacherId("");
        setAddError("");
        setAddSuccess("");
    };

    const handleAddDirector = async () => {
        if (!selectedInstituteId) {
            setAddError("Выберите институт");
            return;
        }
        if (!selectedTeacherId) {
            setAddError("Выберите преподавателя");
            return;
        }
        setAddLoading(true);
        setAddError("");
        setAddSuccess("");
        try {
            const res = await api.post(
                "/api/admin/director",
                {
                    teacherId: Number(selectedTeacherId),
                    instituteId: Number(selectedInstituteId),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data === true || res.status === 200 || res.status === 201) {
                setAddSuccess("Директор успешно добавлен!");
                fetchDirectors();
                setTimeout(() => closeModal(), 1200);
            } else {
                setAddError("Не удалось добавить директора");
            }
        } catch (err) {
            setAddError(err.response?.data?.message ?? "Ошибка при добавлении");
        } finally {
            setAddLoading(false);
        }
    };

    const handleDelete = async (directorId) => {
        if (!window.confirm("Удалить директора?")) return;
        setDeletingId(directorId);
        setDeleteError("");
        try {
            const res = await api.delete(`/api/admin/director/${directorId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data === true || res.status === 200 || res.status === 204) {
                setDirectors((prev) =>
                    prev.filter((d) => (d.directorId ?? d.id) !== directorId)
                );
            } else {
                setDeleteError("Не удалось удалить директора");
            }
        } catch (err) {
            setDeleteError(err.response?.data?.message ?? "Ошибка при удалении");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="ad-root">
            <div className="header">
                <NavBar />
            </div>

            <div className="ad-container">
                <div className="ad-header">
                    <div className="ad-header__left">
                        <h1 className="ad-title">
                            <span className="ad-title__icon">🎓</span>
                            Директора институтов
                        </h1>
                        <p className="ad-subtitle">
                            Управление директорами по каждому институту
                        </p>
                    </div>
                    <button
                        className="ad-btn ad-btn--main"
                        onClick={() => openAddModal()}
                    >
                        + Назначить директора
                    </button>
                </div>

                {deleteError && (
                    <div className="ad-alert ad-alert--error">✗ {deleteError}</div>
                )}

                {loadingDirectors ? (
                    <div className="ad-empty">
                        <span className="ad-empty__icon">⏳</span>
                        <p>Загрузка...</p>
                    </div>
                ) : instituteGroups.length === 0 ? (
                    <div className="ad-empty">
                        <span className="ad-empty__icon">📋</span>
                        <p>Директора не найдены</p>
                    </div>
                ) : (
                    <div className="ad-institutes">
                        {instituteGroups.map((inst) => (
                            <div key={inst.id} className="ad-card">
                                <div className="ad-card__header">
                                    <div>
                                        <h2 className="ad-card__title">{inst.name}</h2>
                                        <span className="ad-card__count">
                                            {inst.directors.length}{" "}
                                            {inst.directors.length === 1 ? "директор" : "директора"}
                                        </span>
                                    </div>
                                    <button
                                        className="ad-btn ad-btn--add"
                                        onClick={() => openAddModal(inst.id)}
                                    >
                                        + Добавить директора
                                    </button>
                                </div>

                                <div className="ad-directors-list">
                                    {inst.directors.map((d) => {
                                        const dId = d.directorId ?? d.id;
                                        return (
                                            <div key={dId} className="ad-director-row">
                                                <div className="ad-director-row__info">
                                                    <span className="ad-director-row__avatar">
                                                        {(d.name ?? "?")[0].toUpperCase()}
                                                    </span>
                                                    <div>
                                                        <p className="ad-director-row__name">
                                                            {d.name ?? "—"}
                                                        </p>
                                                        {d.email && (
                                                            <p className="ad-director-row__email">
                                                                {d.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    className="ad-btn ad-btn--delete"
                                                    disabled={deletingId === dId}
                                                    onClick={() => handleDelete(dId)}
                                                >
                                                    {deletingId === dId ? "..." : "Удалить"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Add Director Modal ── */}
            {showModal && (
                <div className="ad-overlay" onClick={closeModal}>
                    <div
                        className="ad-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="ad-modal__header">
                            <h3 className="ad-modal__title">Назначить директора</h3>
                            <button className="ad-modal__close" onClick={closeModal}>
                                ✕
                            </button>
                        </div>

                        <div className="ad-modal__body">
                            <label className="ad-label" htmlFor="ad-inst-select">Институт</label>
                            <select
                                id="ad-inst-select"
                                className="ad-select"
                                value={selectedInstituteId}
                                onChange={(e) => setSelectedInstituteId(e.target.value)}
                            >
                                <option value="">— Выберите институт —</option>
                                {institutes.map((inst) => {
                                    const instId = inst.instituteId ?? inst.id;
                                    return (
                                        <option key={instId} value={instId}>
                                            {inst.name}
                                        </option>
                                    );
                                })}
                            </select>

                            <label className="ad-label" style={{ marginTop: "16px" }} htmlFor="ad-teacher-select">
                                Преподаватель
                            </label>
                            <select
                                id="ad-teacher-select"
                                className="ad-select"
                                value={selectedTeacherId}
                                onChange={(e) => setSelectedTeacherId(e.target.value)}
                            >
                                <option value="">— Выберите преподавателя —</option>
                                {teachers.map((t) => (
                                    <option key={t.teacherId} value={t.teacherId}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>

                            {addError && (
                                <div className="ad-alert ad-alert--error">{addError}</div>
                            )}
                            {addSuccess && (
                                <div className="ad-alert ad-alert--success">{addSuccess}</div>
                            )}
                        </div>

                        <div className="ad-modal__footer">
                            <button
                                className="ad-btn ad-btn--cancel"
                                onClick={closeModal}
                                disabled={addLoading}
                            >
                                Отмена
                            </button>
                            <button
                                className="ad-btn ad-btn--confirm"
                                onClick={handleAddDirector}
                                disabled={addLoading}
                            >
                                {addLoading ? "Добавление..." : "Назначить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
