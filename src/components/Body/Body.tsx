import React from 'react'
import './Body.scss'

import { Icon } from 'components'

const WORKS = [
  {
    name: 'QUANTITATIVE LIFE',
    link: 'https://hongbinli.com/quantitative-life',
  },
  {
    name: 'SHADER PLAYGROUND',
    link: 'https://hongbinli.com/shader-playground',
  },
  {
    name: 'THREE ARCHIVE',
    link: 'https://hongbinli.com/three-archive',
  },
]

const Body: React.FC = () => {
  return (
    <div className="body">
      <header>
        <h1 className="title">HONGBIN LI</h1>
        <p className="intro">An enthusiastic web developer / front-end engineer.</p>
        <p className="intro">
          Put an eye on web development, UI & UX design, industrial design, fashion, finance, etc.
        </p>
        <ul className="links">
          <li className="links-item">
            <a href="https://github.com/hblee12294" target="_blank" rel="noopener noreferrer">
              <Icon type="GitHub" />
            </a>
          </li>
          <li className="links-item">
            <a href="https://www.linkedin.com/in/hongbin-li" target="_blank" rel="noopener noreferrer">
              <Icon type="LinkedIn" />
            </a>
          </li>
          <li className="links-item">
            <a href="https://www.instagram.com/hblee12294/" target="_blank" rel="noopener noreferrer">
              <Icon type="Instagram" />
            </a>
          </li>
        </ul>
        <ul className="works">
          {WORKS.map(work => (
            <li key={work.link} className="works-item">
              <a className="works-link" href={work.link} target="_blank" rel="noopener noreferrer">
                {work.name}
              </a>
            </li>
          ))}
        </ul>
      </header>
    </div>
  )
}

export default Body
