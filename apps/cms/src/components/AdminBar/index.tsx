'use client'

import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'

import { cn } from '@shna/shared/utilities/ui'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.scss'

import { getClientSideURL, getSiteURL } from '@shna/shared/utilities/getURL'

const baseClass = 'admin-bar'

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = () => {
  const [isAuthed, setIsAuthed] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const router = useRouter()
  const siteURL = getSiteURL() || (typeof window !== 'undefined' ? window.location.origin : '')

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return null
        return response.json()
      })
      .then((data) => {
        const user = data?.user
        if (!user?.id) {
          setIsAuthed(false)
          setDisplayName(null)
          return
        }
        setIsAuthed(true)
        const name = user?.name as string | undefined
        const email = user?.email as string | undefined
        setDisplayName(name || email || null)
      })
      .catch(() => {
        setIsAuthed(false)
        setDisplayName(null)
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    setDisplayName(null)
    setIsAuthed(false)
    router.refresh()
  }

  return (
    <div className={cn(baseClass, 'admin-bar--visible')}>
      <div className="container admin-bar__inner">
        <div className="admin-bar__left">YOU ARE VIEWING THE CMS VERSION OF THE WEBSITE</div>
        <nav aria-label="CMS utilities">
          <ul className="admin-bar__links">
            <li>
              <a className="admin-bar__link" href={siteURL}>
                Main Site
              </a>
            </li>
            <li>
              <a className="admin-bar__link" href={`${getClientSideURL()}/admin`}>
                Admin Dashboard
              </a>
            </li>
            {isAuthed && (
              <li>
                <button
                  className="admin-bar__link admin-bar__button"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout{displayName ? ` (${displayName})` : ''}
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  )
}
