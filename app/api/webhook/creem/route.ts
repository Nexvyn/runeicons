import { Webhook } from "@creem_io/nextjs";

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,
  onGrantAccess: async ({ customer, metadata }) => {
    console.log("Grant access to", customer.email, metadata);
  },
  onRevokeAccess: async ({ customer, metadata }) => {
    console.log("Revoke access from", customer.email, metadata);
  },
});
