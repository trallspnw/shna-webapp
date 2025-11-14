import { getPayload, Payload } from "payload";
import configPromise from '@payload-config'
import { person } from "../../generated/prisma";
import { DEFAULT_LANGUAGE, Language } from "@/packages/common/src/types/language";
import { resolveLocalizedText } from "@/packages/common/src/lib/translation";
import { renderEmailBlocks } from '@common/lib/emailBlockUtil'
import React from "react";
import { renderToHtml } from "./emailRenderer";

let payloadPromise: Promise<Payload> | null = null

/**
 * Sends emails via payload utils and configuration.
 * @param persons The persons to send the email to
 * @param slug The slug of the email to send
 * @param params Params used in the email blocks
 */
export async function sendEmails(persons: person[], slug: string, params: Record<string, string>) {
  const payload = await getPayloadPromise()
  const email = await getEmailBySlug(slug)
  if (!email) throw new Error(`Email with slug "${slug}" not found.`)

  const blocks = email.blocks ?? []

  for (const person of persons) {
    const language = person.language as Language || DEFAULT_LANGUAGE
    const subject = resolveLocalizedText(email.subject, language)

    // Payload doesn't accept email body as JSX. Content must be rendered as HTML.
    const html = await renderToHtml(React.createElement(
      React.Fragment, null, renderEmailBlocks(blocks, language, params)))

    await payload.sendEmail({
      to: person.email,
      subject,
      html,
    })
  }
}

/**
 * Gets an email by slug.
 * @param slug The slug of the email to get
 * @returns The email document for the slug
 */
async function getEmailBySlug(slug: string) {
  const payload = await getPayloadPromise()
  const { docs } = await payload.find({
    collection: 'emails',
    where: {
      slug: { equals: slug },
    },
    limit: 1,
  })
  return docs?.[0] ?? null
}

/**
 * Gets the Payload Promise. Creates it if needed. Avoids instantiation at buildtime. 
 * @returns A Payload Promise
 */
async function getPayloadPromise(): Promise<Payload> {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config: configPromise })
  }
  return payloadPromise
}
