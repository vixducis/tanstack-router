import { match } from 'assert'
import axios from 'axios'
import { produce } from 'immer'
import { actionDelayFn, loaderDelayFn, shuffle } from './utils'
export type Invoice = {
  id: string
  title: string
  body: string
}

export interface User {
  id: number
  name: string
  username: string
  email: string
  address: Address
  phone: string
  website: string
  company: Company
}
export interface Address {
  street: string
  suite: string
  city: string
  zipcode: string
  geo: Geo
}

export interface Geo {
  lat: string
  lng: string
}

export interface Company {
  name: string
  catchPhrase: string
  bs: string
}

let invoices: Invoice[] = null!
let users: User[] = null!

let invoicesPromise: Promise<void>
let usersPromise: Promise<void>

const ensureInvoices = async () => {
  if (!invoicesPromise) {
    invoicesPromise = Promise.resolve().then(async () => {
      const { data } = await axios.get(
        'https://jsonplaceholder.typicode.com/posts',
      )
      invoices = data.slice(0, 10)
    })
  }

  await invoicesPromise
}

const ensureUsers = async () => {
  if (!usersPromise) {
    usersPromise = Promise.resolve().then(async () => {
      const { data } = await axios.get(
        'https://jsonplaceholder.typicode.com/users',
      )
      users = data.slice(0, 10)
    })
  }

  await usersPromise
}

export async function fetchInvoices() {
  return loaderDelayFn(() => ensureInvoices().then(() => invoices))
}

export async function fetchInvoiceById(id: string) {
  return loaderDelayFn(() =>
    ensureInvoices().then(() => {
      const invoice = invoices.find((d) => String(d.id) === id)
      if (invoice) {
        return {
          ...invoice,
          body: `${invoice.body} ${Date.now()}`,
        }
      }
      return invoice
    }),
  )
}

export async function postInvoice(partialInvoice: Partial<Invoice>) {
  return actionDelayFn(() => {
    if (partialInvoice.title?.includes('error')) {
      console.log('error')
      throw new Error('Ouch!')
    }
    const invoice = {
      id: `${invoices.length + 1}`,
      title:
        partialInvoice.title ?? `New Invoice ${String(Date.now()).slice(0, 5)}`,
      body:
        partialInvoice.body ??
        shuffle(
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. 
      Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna.  Integer id quam. Morbi mi. Quisque nisl felis, venenatis tristique, dignissim in, ultrices sit amet, augue. Proin sodales libero eget ante.
      `.split(' '),
        ).join(' '),
    }
    invoices = [...invoices, invoice]
    return invoice
  })
}

export async function patchInvoice(updatedInvoice: Partial<Invoice>) {
  return actionDelayFn(() => {
    invoices = produce(invoices, (draft) => {
      let invoice = draft.find((d) => String(d.id) === updatedInvoice.id)
      if (!invoice) {
        throw new Error('Invoice not found.')
      }
      Object.assign(invoice, updatedInvoice)
    })

    return invoices.find((d) => d.id === updatedInvoice.id)
  })
}

export async function fetchUsers() {
  return loaderDelayFn(() => ensureUsers().then(() => users))
}

export async function fetchUserById(id: string) {
  return loaderDelayFn(() =>
    ensureUsers().then(() => users.find((d) => String(d.id) === id)),
  )
}