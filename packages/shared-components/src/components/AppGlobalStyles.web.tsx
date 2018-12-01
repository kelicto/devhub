import React from 'react'

import { Theme } from 'shared-core/dist/types'
import { useTheme } from './context/ThemeContext'

function getStyles(params: { theme: Theme }) {
  return `
    ::-webkit-scrollbar-thumb
    {
      background-color: ${params.theme.backgroundColorDarker08};
    }
  `
}

export function AppGlobalStyles() {
  const theme = useTheme()

  return <style>{getStyles({ theme })}</style>
}