/** Static copy for the footer Help pages (`/help/:topic`). Placeholder policy text for the demo. */
export interface InfoSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface HelpTopic {
  slug: string;
  title: string;
  intro: string;
  sections: InfoSection[];
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    slug: 'payment-options',
    title: 'Payment Options',
    intro: 'Choose how to pay when you place your order. All prices are in US dollars.',
    sections: [
      {
        heading: 'Direct Bank Transfer',
        paragraphs: [
          'Make your payment directly into our bank account and use your order number (for example FUR-000123) as the payment reference.',
          'Your order is shipped once the funds have cleared, which usually takes one to two working days.',
        ],
      },
      {
        heading: 'Cash On Delivery',
        paragraphs: [
          'Pay in cash when your order arrives. Please have the exact amount ready; our drivers cannot always give change.',
        ],
      },
      {
        heading: 'Good to know',
        paragraphs: [],
        list: [
          'Shipping is free on every order.',
          'We do not take card payments online, and we never ask for card details by email or phone.',
          'Your order confirmation page always shows the payment method you chose.',
        ],
      },
    ],
  },
  {
    slug: 'returns',
    title: 'Returns',
    intro: 'Changed your mind? You can return most items within 30 days of delivery.',
    sections: [
      {
        heading: 'What you can return',
        paragraphs: [
          'Items must be unused, in their original condition and, where possible, in the original packaging.',
        ],
        list: [
          'Furniture and decor: within 30 days of delivery',
          'Made-to-order upholstery: only if it arrives damaged or faulty',
          'Clearance items: exchange only',
        ],
      },
      {
        heading: 'How to start a return',
        paragraphs: [
          'Send us a message through the contact page with your order number and the items you would like to return. We will arrange a collection time that suits you.',
        ],
      },
      {
        heading: 'Refunds',
        paragraphs: [
          'Once we have checked the returned items, we refund you by bank transfer within 10 working days. Collection is free if the item arrived damaged or faulty.',
        ],
      },
    ],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    intro: 'We only keep what we need to run the store, and we never sell your data.',
    sections: [
      {
        heading: 'What we store',
        paragraphs: [],
        list: [
          'Your account details (name and email) if you register',
          'The billing details you enter for each order',
          'Messages you send through the contact form',
          'Your email address if you subscribe to the newsletter',
        ],
      },
      {
        heading: 'What stays in your browser',
        paragraphs: [
          'Your browser keeps your cart ID, your login session and the products you are comparing, so they survive a page reload. Logging out clears the session and the cart ID.',
        ],
      },
      {
        heading: 'Emails',
        paragraphs: [
          'This is a demo store: contact messages and newsletter sign-ups are saved, but no emails are sent.',
        ],
      },
    ],
  },
];

export const findHelpTopic = (slug: string) => HELP_TOPICS.find((topic) => topic.slug === slug);
