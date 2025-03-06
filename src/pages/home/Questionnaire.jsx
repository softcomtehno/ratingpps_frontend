import NavBar from "../../components/NavBar"
import { Link } from "react-router-dom"

function Questionnaire() {
  return (
    <div className="сontents">
      <div className="header">
        <NavBar/>
      </div>
      <div className="main">
        <div className="title__contain-M"><h2 className="Edu__text-M">Анкета институтов</h2></div>
        <div className="table__links Edu__text-S">
          <ul>
            <li><Link className="Link" to="https://intuit.kg/faculties/institut-cifrovoj-transformacii-i-programmirovaniya/">Институт цифровой трансформации и программирования</Link></li>
            <li><Link className="Link" to="https://intuit.kg/faculties/institut-dizajna-arhitektury-i-tekstilya/">Институт дизайна, архитектуры и текстиля</Link></li>
            <li><Link className="Link" to="https://intuit.kg/faculties/institut-stroitelstva-i-innovacionnyh-tehnologij/">Институт строительства и инновационных технологий</Link></li>
            <li><Link className="Link" to="https://intuit.kg/faculties/institut-energetiki-i-transporta/">Институт энергетики и транспорта</Link></li>
            <li><Link className="Link" to="https://intuit.kg/faculties/institut-ekonomiki-i-menedzhmenta/">Институт экономики и менеджмента</Link></li>
            <li><Link className="Link" to="https://intuit.kg/faculties/institut-mezhkulturnoj-kommunikacii-i-psihologii/">Институт межкультурной коммуникации и психологии</Link></li>
            <li><Link className="Link" to="https://intuit.kg/faculties/rossijsko-kyrgyzskij-institut-avtomatizacii-upravleniya-biznesa/">Российско-Кыргызский институт автоматизации управления бизнеса</Link></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Questionnaire