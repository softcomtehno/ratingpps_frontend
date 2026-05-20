/**
 * YearSelector — компонент для выбора академического года на страницах рейтинга.
 *
 * Props:
 *   years        — массив годов [{ id, name, isCurrent, isLocked }]
 *   selectedYear — текущий выбранный год
 *   onChange     — callback(year) при изменении
 *   loading      — флаг загрузки
 */
function YearSelector({ years, selectedYear, onChange, loading }) {
  if (loading || years.length === 0) return null;

  return (
    <div
      id="year-selector"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
        margin: "0 0 18px 0",
      }}
    >
      <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500, whiteSpace: "nowrap" }}>
        📅 Учебный год:
      </span>
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        {years.map((year) => {
          const isSelected = selectedYear?.id === year.id;
          return (
            <button
              key={year.id}
              id={`year-btn-${year.id}`}
              onClick={() => onChange(year)}
              title={year.isLocked ? "Год закрыт (архив)" : "Выбрать год"}
              style={{
                padding: "5px 14px",
                borderRadius: "20px",
                border: isSelected ? "2px solid #2563eb" : "1px solid #cbd5e1",
                background: isSelected ? "#2563eb" : "#f8fafc",
                color: isSelected ? "#fff" : "#475569",
                fontWeight: isSelected ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {year.name}
              {year.isCurrent && !isSelected && (
                <span style={{ fontSize: "10px", color: "#2563eb" }}>●</span>
              )}
              {year.isLocked && (
                <span style={{ fontSize: "10px", opacity: 0.7 }}>🔒</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default YearSelector;
