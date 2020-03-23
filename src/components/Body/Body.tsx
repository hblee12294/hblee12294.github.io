import React from 'react'
import './Body.scss'

import { Icon } from 'components'

const Body: React.FC = () => {
  return (
    <div className="body">
      <header>
        <h1 className="title">HONGBIN LI</h1>
        <p className="intro">
          An enthusiastic web developer / front-end engineer. Put an eye on web development technology, design, fasion,
          finance, world, etc.
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
          <li className="works-item">
            <a
              className="works-link"
              href="https://hongbinli.com/three-archive"
              target="_blank"
              rel="noopener noreferrer"
            >
              THREE ARCHIVE
            </a>
          </li>
          <li className="works-item">
            <a
              className="works-link"
              href="https://hongbinli.com/quantitative-life"
              target="_blank"
              rel="noopener noreferrer"
            >
              QUANTITATIVE LIFE
            </a>
          </li>
        </ul>
      </header>
    </div>
  )
}

export default Body
