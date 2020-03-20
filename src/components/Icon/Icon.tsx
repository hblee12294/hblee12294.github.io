import React from 'react'
import './Icon.scss'

import { ReactComponent as GitHub } from 'assets/github.svg'
import { ReactComponent as LinkedIn } from 'assets/linkedin.svg'
import { ReactComponent as Instagram } from 'assets/instagram.svg'

const IconMap = {
  GitHub,
  LinkedIn,
  Instagram,
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
  type: keyof typeof IconMap
  size?: number
}

const Icon: React.FC<IconProps> = ({ type, size = 20, ...svgProps }) => (
  <i className="icon">
    {React.createElement(IconMap[type], { fill: 'currentColor', width: size, height: size, ...svgProps })}
  </i>
)

export default Icon
