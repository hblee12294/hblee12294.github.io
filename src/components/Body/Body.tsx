import React from 'react'
import './Body.scss'

import { Icon } from 'components'

const Body: React.FC = () => {
  return (
    <div className="body">
      <header>
        <h1 className="title">HBLEE</h1>
        <p className="intro">
          An enthusiastic web developer / front-end engineer. Put an eye on web development technology, desgin, finance,
          etc.
        </p>
        <ul>
          <li>
            <Icon type="GitHub" />
          </li>
          <li>
            <Icon type="LinkedIn" />
          </li>
          <li>
            <Icon type="Instagram" />
          </li>
        </ul>
      </header>
    </div>
  )
}

export default Body
