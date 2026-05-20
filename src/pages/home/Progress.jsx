import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import RegNav from "../../components/RegNav";
import AccountConf from "../../components/AccountConf";
import api from "../../services/api";

function Progress() {
  const navigate = useNavigate();
  const [send, setSend] = useState("Отправить");
  const [degree, setDegree] = useState([]);
  const [rank, setRank] = useState([]);
  const [stateAwards, setStateAwards] = useState([]);
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedRank, setSelectedRank] = useState("");
  const [awardInputs, setAwardInputs] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get("/api/user/progress");
      const dataArray = Array.isArray(response.data?.[0]) ? response.data[0] : [];

      const degrees = dataArray.find(item => item.name === "Ученая степень");
      const ranks = dataArray.find(item => item.name === "Ученое звание");
      const awards = dataArray.find(item => item.name === "Гос.награды");

      const normalizedAwards = awards?.personalAwardsSubtitles?.map(award => ({
        id: award.id,
        name: award.name,
      })) ?? [];

      setDegree(degrees?.personalAwardsSubtitles ?? []);
      setRank(ranks?.personalAwardsSubtitles ?? []);
      setStateAwards(normalizedAwards);

      setAwardInputs(
        normalizedAwards.reduce((acc, award) => {
          acc[award.id] = { checked: false, link: "" };
          return acc;
        }, {})
      );
    } catch {
      // no-op: общий 401 и ошибки обрабатываются в api interceptor
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAwardToggle = useCallback((awardId, checked) => {
    setAwardInputs(prev => ({
      ...prev,
      [awardId]: {
        ...(prev[awardId] ?? { link: "" }),
        checked,
      },
    }));
  }, []);

  const handleAwardLinkChange = useCallback((awardId, link) => {
    setAwardInputs(prev => ({
      ...prev,
      [awardId]: {
        ...(prev[awardId] ?? { checked: false }),
        link,
      },
    }));
  }, []);

  const handleSubmit = useCallback(async e => {
    e.preventDefault();

    const awards = {};
    if (selectedDegree) awards.a = { subId: Number(selectedDegree) };
    if (selectedRank) awards.b = { subId: Number(selectedRank) };

    stateAwards.forEach((award, index) => {
      const awardValue = awardInputs[award.id];
      if (!awardValue?.checked) {
        return;
      }

      const awardKey = String.fromCharCode(99 + index);
      awards[awardKey] = {
        subId: award.id,
        link: awardValue.link.trim(),
      };
    });

    try {
      await api.post("/api/user/progress/add", { awards });
      setSend("Отправлено");
    } catch {
      // no-op: сообщение об ошибке можно добавить отдельным UX шагом
    }
  }, [selectedDegree, selectedRank, stateAwards, awardInputs]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="private-office-contents">
      <div className="header">
        <NavBar />
        <div className="private-office-bg"></div>
      </div>
      <div className="private-office__main">
        <AccountConf />
        <div className="auth__contain-doble">
          <RegNav />
          <h2 className="Edu__text-M Edu__text-M-office">Личные достижения</h2>
          <label htmlFor="" className="auth__label">
            <form onSubmit={handleSubmit}>
              <div className="auth_auth">
                <select
                  value={selectedDegree}
                  onChange={e => setSelectedDegree(e.target.value)}
                  className="input__office input__text-s Montherat"
                >
                  <option value="">Ученая степень</option>
                  {degree.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedRank}
                  onChange={e => setSelectedRank(e.target.value)}
                  className="input__office input__text-s Montherat"
                >
                  <option value="">Ученое звание</option>
                  {rank.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <h2 className="Edu__text-S Edu__text-S-office">Государственные награды</h2>
                <div className="awards">
                  {stateAwards.map(award => {
                    const values = awardInputs[award.id] ?? { checked: false, link: "" };
                    const checkboxId = `award-${award.id}`;
                    const linkInputId = `award-link-${award.id}`;

                    return (
                      <div className="awards__block" key={award.id}>
                        <div className="input__office input__text-s Montherat">
                          <input
                            type="checkbox"
                            className="checkbox"
                            id={checkboxId}
                            checked={values.checked}
                            onChange={e => handleAwardToggle(award.id, e.target.checked)}
                          />
                          <label htmlFor={checkboxId}>{award.name}</label>
                        </div>
                        <input
                          type="text"
                          id={linkInputId}
                          className="input__office input__text-s Montherat"
                          placeholder="Введите ссылку"
                          value={values.link}
                          onChange={e => handleAwardLinkChange(award.id, e.target.value)}
                          disabled={!values.checked}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <button type="submit" className="bnt__reg btn__green btn__link">
                {send}
              </button>
              <button type="button" onClick={goBack} className="btn__link btn__blue montherat">
                Назад
              </button>
            </form>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Progress;
