import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";
import AccountConf from "../../components/AccountConf";
import StageNav from "../../components/StageNav";
import api from "../../services/api";
import "../../css/Awards.css";

function AwardsPage() {
  const navigate = useNavigate();
  const { stageId } = useParams(); // from /awards/:stageId

  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // { [subtitleId]: "link value" }
  const [linkValues, setLinkValues] = useState({});

  // accordion open state: { [titleId]: true/false }
  const [openTitles, setOpenTitles] = useState({});

  const [submitStatus, setSubmitStatus] = useState(null); // null | 'sending' | 'success' | 'error'
  const [submitMsg, setSubmitMsg] = useState("");

  // Fetch all stages from API
  useEffect(() => {
    let mounted = true;
    const fetchAwards = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/api/award/all");
        if (!mounted) return;
        const data = res.data;
        setStages(data.stages || []);
      } catch (e) {
        if (!mounted) return;
        setError("Ошибка загрузки данных. Попробуйте обновить страницу.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAwards();
    return () => { mounted = false; };
  }, []);

  // Determine current stage
  const currentStageId = stageId ? Number(stageId) : (stages[0]?.stageId ?? null);
  const currentStage = stages.find((s) => s.stageId === currentStageId) || null;

  // Redirect to first stage if no stageId in URL and stages loaded
  useEffect(() => {
    if (!stageId && stages.length > 0) {
      navigate(`/awards/${stages[0].stageId}`, { replace: true });
    }
  }, [stageId, stages, navigate]);

  // Reset form when stage changes
  useEffect(() => {
    setLinkValues({});
    setOpenTitles({});
    setSubmitStatus(null);
    setSubmitMsg("");
  }, [currentStageId]);

  const handleLinkChange = useCallback((subtitleId, value) => {
    setLinkValues((prev) => ({ ...prev, [subtitleId]: value }));
  }, []);

  const toggleTitle = useCallback((titleId) => {
    setOpenTitles((prev) => ({ ...prev, [titleId]: !prev[titleId] }));
  }, []);

  // Submit filled links
  const handleSubmit = async () => {
    if (!currentStage) return;

    // Gather all filled subtitle links
    const entries = [];
    currentStage.titles.forEach((title) => {
      title.subtitles.forEach((sub) => {
        const link = (linkValues[sub.subtitleId] || "").trim();
        if (link) {
          entries.push({ subtitleId: sub.subtitleId, link });
        }
      });
    });

    if (entries.length === 0) {
      setSubmitStatus("error");
      setSubmitMsg("Заполните хотя бы одну ссылку перед отправкой.");
      return;
    }

    setSubmitStatus("sending");
    setSubmitMsg("");

    try {
      // Send each entry to the API
      await Promise.all(
        entries.map((entry) =>
          api.post("/api/teacher/answer", entry)
        )
      );
      setSubmitStatus("success");
      setSubmitMsg("Данные успешно отправлены!");
    } catch (e) {
      setSubmitStatus("error");
      setSubmitMsg(
        e.response?.data?.message ||
        "Ошибка при отправке данных. Попробуйте ещё раз."
      );
    }
  };

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="private-office-contents">
      <div className="header">
        <NavBar />
      </div>

      <div className="private-office__main">
        <AccountConf />

        <div className="auth__contain-doble">
          {/* Shared stage tabs */}
          <StageNav />

          {/* Page title */}
          {currentStage && (
            <h2 className="Edu__text-M Edu__text-M-office">
              {currentStage.stageName}
            </h2>
          )}

          {/* Content */}
          <div className="awards-content">
            {loading ? (
              <div className="awards-loading">Загрузка данных...</div>
            ) : error ? (
              <div className="awards-error">{error}</div>
            ) : !currentStage ? (
              <div className="awards-error">Этап не найден.</div>
            ) : (
              <>
                {currentStage.titles.map((title) => (
                  <div className="awards-title-block" key={title.titleId}>
                    {/* Title header (accordion toggle) */}
                    <button
                      className="awards-title-header"
                      onClick={() => toggleTitle(title.titleId)}
                      type="button"
                    >
                      <span>{title.titleName}</span>
                      <span className={`awards-title-arrow${openTitles[title.titleId] ? " open" : ""}`}>
                        ▼
                      </span>
                    </button>

                    {/* Subtitles (when open) */}
                    {openTitles[title.titleId] && (
                      <div className="awards-subtitles">
                        {title.subtitles.map((sub) => (
                          <div className="awards-subtitle-row" key={sub.subtitleId}>
                            <span className="awards-subtitle-name">
                              {sub.subtitleName}
                            </span>
                            <input
                              className="awards-subtitle-input"
                              type="text"
                              placeholder="Вставьте ссылку"
                              value={linkValues[sub.subtitleId] || ""}
                              onChange={(e) => handleLinkChange(sub.subtitleId, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Actions */}
                <div className="awards-actions">
                  <button
                    className="awards-submit-btn"
                    onClick={handleSubmit}
                    disabled={submitStatus === "sending"}
                    type="button"
                  >
                    {submitStatus === "sending" ? "Отправка..." : "Отправить"}
                  </button>
                  <button
                    className="awards-back-btn"
                    onClick={handleBack}
                    type="button"
                  >
                    Назад
                  </button>
                  {submitStatus === "success" && (
                    <span className="awards-success-msg">{submitMsg}</span>
                  )}
                  {submitStatus === "error" && (
                    <span className="awards-error-msg">{submitMsg}</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AwardsPage;
