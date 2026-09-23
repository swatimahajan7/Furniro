/** Friendly aliases over the generated OpenAPI types. Never hand-write response shapes. */
import type { components } from './schema';

type Schemas = components['schemas'];

export type Health = Schemas['HealthRead'];
export type MetaConfig = Schemas['MetaConfigRead'];
export type Country = Schemas['CountryRead'];

export type ProductSummary = Schemas['ProductSummary'];
export type ProductDetail = Schemas['ProductDetail'];
export type ProductSort = Schemas['ProductSort'];
export type ProductPage = Schemas['Page_ProductSummary_'];
export type RelatedProducts = Schemas['RelatedProducts'];
export type CompareResponse = Schemas['CompareResponse'];
export type Review = Schemas['ReviewRead'];
export type ReviewPage = Schemas['Page_ReviewRead_'];
export type Category = Schemas['CategoryRead'];
export type Room = Schemas['RoomRead'];
export type Inspiration = Schemas['InspirationRead'];

export type Cart = Schemas['CartRead'];
export type CartItem = Schemas['CartItemRead'];
export type CartItemAdd = Schemas['CartItemAdd'];
export type Order = Schemas['OrderRead'];
export type OrderItem = Schemas['OrderItemRead'];
export type BillingIn = Schemas['BillingIn'];
export type PaymentMethod = Schemas['PaymentMethod'];

export type ErrorResponse = Schemas['ErrorResponse'];
