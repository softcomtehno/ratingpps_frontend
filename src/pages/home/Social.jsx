import axios from 'axios';
import { useCallback, useEffect, useState, useRef } from 'react';
import AccountConf from '../../components/AccountConf';
import NavBar from '../../components/NavBar';
import RegNav from '../../components/RegNav';
import { useNavigate } from 'react-router-dom';

const Social = () => {
  const [isOpen, setIsOpen] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectNames, setSelectNames] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [sent, setSent] = useState("Отправить");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const containerRefs = useRef([]);

  const toggleDropdown = (index) => {
    const updatedIsOpen = isOpen.map((open, i) => (i === index ? !open : false));
    setIsOpen(updatedIsOpen);
  };

  const handleOptionClick = (optionIndex, subtitleIndex, subtitle) => {
    const updatedSelectedOptions = [...selectedOptions];
    updatedSelectedOptions[optionIndex] = subtitle;
    setSelectedOptions(updatedSelectedOptions);

    const updatedIsOpen = isOpen.map(() => false);
    setIsOpen(updatedIsOpen);
  };

  const addInput = (optionIndex, subtitleIndex) => {
    setInputValues(prevState => ({
      ...prevState,
      [optionIndex]: {
        ...prevState[optionIndex],
        [subtitleIndex]: [...(prevState[optionIndex]?.[subtitleIndex] || []), '']
      }
    }));
  };

  const sendDataToAPI = async () => {
    try {
      const socialsData = {};
      options.forEach((optionGroup, optionIndex) => {
        optionGroup.subtitles.forEach((subtitle, subtitleIndex) => {
          const subData = inputValues[optionIndex]?.[subtitleIndex] || [];
          const subId = subtitle.id;
          subData.forEach((link, linkIndex) => {
            socialsData[`${optionIndex}_${subtitleIndex}_${linkIndex}`] = {
              subId: subId,
              link: link
            };
          });
        });
      });

      const response = await axios.post(
        "https://api.pps.makalabox.com/api/user/social/add",
        { socials: socialsData },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("Data sent successfully:", response.data);
      setSent("Отправлено");
    } catch (error) {
      console.error("Error sending data:", error);
      setSent("Ошибка");
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get("https://api.pps.makalabox.com/api/user/social", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = response.data[0];
      const newOptions = data.map(item => ({
        ...item,
        subtitles: item.socialActivitiesSubtitles.map(subtitle => ({
          id: subtitle.id,
          name: subtitle.name
        }))
      }));
      const newSelectNames = data.map(item => item.name);
      setOptions(newOptions);
      setSelectNames(newSelectNames);
      setIsOpen(new Array(newOptions.length).fill(false));
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRefs.current.every(ref => ref && !ref.contains(event.target))) {
        setIsOpen(isOpen.map(() => false));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const Back = useCallback(() => {
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
          <RegNav />
          <h2 className='Edu__text-M Edu__text-M-office'>Воспитательная, общественная деятельность</h2>
          <div className="auth-auth-c">
            {options.map((optionGroup, optionIndex) => (
              <div className="custom-select-container" key={optionIndex} ref={el => containerRefs.current[optionIndex] = el}>
                <div className="selected-option" onClick={() => toggleDropdown(optionIndex)}>
                  {selectNames[optionIndex]}
                </div>
                {isOpen[optionIndex] && (
                  <div className="options">
                    {optionGroup.subtitles.map((subtitle, subtitleIndex) => (
                      <div key={subtitleIndex} className="option">
                        <div onClick={() => handleOptionClick(optionIndex, subtitleIndex, subtitle)}>{subtitle.name}</div>
                        <div className="option__link">
                          {inputValues[optionIndex]?.[subtitleIndex]?.map((value, inputIndex) => (
                            <input
                              key={inputIndex}
                              type="text"
                              value={value}
                              onChange={(e) => {
                                const newInputValues = { ...inputValues };
                                newInputValues[optionIndex][subtitleIndex][inputIndex] = e.target.value;
                                setInputValues(newInputValues);
                              }}
                            />
                          ))}
                        </div>
                        <button onClick={() => addInput(optionIndex, subtitleIndex)} className='add__link'>Добавить</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="submit" onClick={sendDataToAPI} className="bnt__reg btn__green btn__link">
            {sent}
          </button>
          <button onClick={Back} className="btn__link btn__blue montherat">
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}

export default Social;