import React from 'react'

export default function FrontendLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <main>{children}</main>
  )
}
