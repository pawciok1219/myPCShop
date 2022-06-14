import { LightningElement } from 'lwc';
import MS_easy_online_shopping from '@salesforce/label/c.MS_easy_online_shopping';
import MS_competitive_prices from '@salesforce/label/c.MS_competitive_prices';
import MS_3000_products from '@salesforce/label/c.MS_3000_products';
import MS_over_10000_customers from '@salesforce/label/c.MS_over_10000_customers';
import MS_fast_and_safe_shipping from '@salesforce/label/c.MS_fast_and_safe_shipping';
import MS_24_7_technical_support from '@salesforce/label/c.MS_24_7_technical_support';

export default class HeaderLogos extends LightningElement {
    label = {
        MS_easy_online_shopping,
        MS_competitive_prices,
        MS_3000_products,
        MS_over_10000_customers,
        MS_fast_and_safe_shipping,
        MS_24_7_technical_support
    };
}