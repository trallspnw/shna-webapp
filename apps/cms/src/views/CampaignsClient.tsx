'use client'

import { Button, Gutter } from "@payloadcms/ui";
import { useState } from "react";
import classes from './CampaignsClient.module.scss'
import { person, subscription } from "../../generated/prisma";

/**
 * Custom admin view for pulling campaign reports
 */
export function CampaignsClient() {
  const [searchInput, setSearchInput] = useState('')
  const [persons, setPersons] = useState<person[]>([])
  const [memberships, setMemberships] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<(subscription & { person: person })[]>([])
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchInput) return

    setLoading(true)
    setStatusMessage('Searching...')
    setPersons([])
    setMemberships([])
    setSubscriptions([])

    try {
      const result = await fetch('/api/campaign/search?query=' + encodeURIComponent(searchInput), {
        method: 'GET',
        credentials: 'include',
      })

      const data = await result.json()
      setPersons(data.persons || [])
      setMemberships(data.memberships || [])
      setSubscriptions(data.subscriptions || [])
      setStatusMessage(data.message || 'Searched people.')
    } catch (e) {
      console.error(e)
      setStatusMessage('Failed search people.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Gutter>
      <h1>Campaign Reports</h1>
      <br />

      <p>Search a ref tag to see its performance</p>
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
            placeholder="Search by ref tag"
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

      {persons.length + memberships.length + subscriptions.length > 0 && (
        <div>
          <h3>Results Summary</h3>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Entity</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>People</td>
                <td>{persons.length}</td>
              </tr>
              <tr>
                <td>Members</td>
                <td>{memberships.length}</td>
              </tr>
              <tr>
                <td>Subscriptions</td>
                <td>{subscriptions.length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {persons.length > 0 && (
        <div>
          <h3>People</h3>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Created</th>
                <th>Language</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((person) => (
                <tr key={person.id}>
                  <td>{person.email}</td>
                  <td>{person.name}</td>
                  <td>{person.phone}</td>
                  <td>{person.address}</td>
                  <td>{person.createdAt ? new Date(person.createdAt).toLocaleString() : ''}</td>
                  <td>{person.language}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {memberships.length > 0 && (
        <div>
          <h3>Memberships</h3>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Household</th>
                <th>Primary Email</th>
                <th>Primary Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((membership) => (
                <tr key={membership.id}>
                  <td>{membership.household?.type}</td>
                  <td>{membership.household?.name}</td>
                  <td>{membership.household?.primaryContact?.email}</td>
                  <td>{membership.household?.primaryContact?.name}</td>
                  <td>{membership.household?.primaryContact?.phone}</td>
                  <td>{membership.household?.primaryContact?.address}</td>
                  <td>{membership.createdAt ? new Date(membership.createdAt).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subscriptions.length > 0 && (
        <div>
          <h3>Subscriptions</h3>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Subscribed</th>
                <th>Language</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>{subscription.person.email}</td>
                  <td>{subscription.person.name}</td>
                  <td>{subscription.person.phone}</td>
                  <td>{subscription.person.address}</td>
                  <td>{subscription.createdAt ? new Date(subscription.createdAt).toLocaleString() : ''}</td>
                  <td>{subscription.person.language}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </Gutter>
  )
}
