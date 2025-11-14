import { Block } from "payload";
import { createLocalizedTextField } from "../fields/localizedTextField";

/**
 * A block for displaying an order summary with localized text.
 */
export const OrderSummary: Block = {
  slug: 'orderSummary',
  interfaceName: 'OrderSummary',
  labels: {
    singular: 'Order Summary',
    plural: 'Order Summaries',
  },
  fields: [
    createLocalizedTextField('heading', 'Heading', true),
    createLocalizedTextField('paidStatus', 'Paid Status', true),
    createLocalizedTextField('unpaidStatus', 'Unpaid Status', true),
    createLocalizedTextField('totalPaidLabel', 'Total Paid Label', true),
    createLocalizedTextField('loadingText', 'Loading Text', true),
    createLocalizedTextField('orderNotFoundText', 'Order Not Found Text', true),
    createLocalizedTextField('returnButtonText', 'Return Button Text', true),
    createLocalizedTextField('retryButtonText', 'Retry Button Text'),
  ],
}
