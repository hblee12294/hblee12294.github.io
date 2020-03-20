import React from 'react'
import './Body.scss'

import { Icon } from 'components'

const Body: React.FC = () => {
  return (
    <div className="body">
      <header>
        <h1 className="title">HBLEE</h1>
        <p className="intro">
          An enthusiastic web developer / front-end engineer. Put an eye on web development technology, design, finance,
          etc.
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
      </header>
    </div>
  )
}

export default Body
