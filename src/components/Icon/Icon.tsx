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
}

const Icon: React.FC<IconProps> = ({ type, ...svgProps }) => (
  <i className="icon">{React.createElement(IconMap[type], { fill: '#fff', ...svgProps })}</i>
)

export default Icon
