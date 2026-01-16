'use client'

import { Button, Gutter } from "@payloadcms/ui";
import { useState } from "react";
import classes from './MembersClient.module.scss'

/**
 * Custom admin view for viewing membership data.
 */
export function MembersClient() {
  const [searchInput, setSearchInput] = useState('')
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchInput) return

    setLoading(true)
    setStatusMessage('Searching...')
    setMembers([])

    try {
      const result = await fetch('/api/membership/search?query=' + encodeURIComponent(searchInput), {
        method: 'GET',
        credentials: 'include',
      })

      const data = await result.json()
      setMembers(data.members || [])
      setStatusMessage(data.message || 'Searched members.')
    } catch (e) {
      console.error(e)
      setStatusMessage('Failed search members.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Gutter>
      <h1>Search Members</h1>
      <p>Lookup member information by name or email</p>
      <br />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
      >
        <div>
          <input 
            type="search"
            placeholder="Search by name or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button 
          type="submit"
          disabled={!searchInput || loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {statusMessage && <>
        <p>{statusMessage}</p>
        <br />
      </>}

      {members.length > 0 && (
        <div>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Household Name</th>
                <th>Primary Email</th>
                <th>Primary Name</th>
                <th>Members</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Active</th>
                <th>Start</th>
                <th>Expiration</th>
                <th>Ref</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.type}</td>
                  <td>{member.name}</td>
                  <td>{member.primaryEmail}</td>
                  <td>{member.primaryName}</td>
                  <td>{member.members?.map((m: any) => m.name || m.email).filter(Boolean).join(', ')}</td>
                  <td>{member.phone}</td>
                  <td>{member.address}</td>
                  <td>{member.active ? 'Yes' : 'No'}</td>
                  <td>{member.startDate ? new Date(member.startDate).toLocaleDateString() : ''}</td>
                  <td>{member.expiresAt ? new Date(member.expiresAt).toLocaleDateString() : ''}</td>
                  <td>{member.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Gutter>
  )
}
