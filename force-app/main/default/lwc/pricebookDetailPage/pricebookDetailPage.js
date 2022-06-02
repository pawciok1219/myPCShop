import { LightningElement, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import getPricebooksProduct from '@salesforce/apex/MS_GetProductsFromPricebook.getProducts';
import recordSelected from '@salesforce/messageChannel/Record_Select__c';
import { getFieldValue, getRecord } from 'lightning/uiRecordApi';
import PRICEBOOK_NAME_FIELD from '@salesforce/schema/Pricebook2.Name';
import { NavigationMixin } from 'lightning/navigation';
import MS_name from '@salesforce/label/c.MS_name';
import MS_price from '@salesforce/label/c.MS_price';
import MS_select_a_pricebook from '@salesforce/label/c.MS_select_a_pricebook';
import MS_details from '@salesforce/label/c.MS_details';
import MS_full_details from '@salesforce/label/c.MS_full_details';
import MS_pricebook_s_products from '@salesforce/label/c.MS_pricebook_s_products';
const PRICEBOOK_FIELDS = [PRICEBOOK_NAME_FIELD];

const cols = [
    { label: MS_name, fieldName:'Name', type: 'text'},
    { label: MS_price, fieldName:'UnitPrice',   type: 'currency',
    typeAttributes: { currencyCode: 'EUR', step: '0.01' }},
];

export default class PricebookDetailPage extends NavigationMixin(LightningElement) {

    label = {
        MS_select_a_pricebook,
        MS_details,
        MS_full_details,
        MS_pricebook_s_products
    };

    subscription = null;
    @wire(MessageContext)
    messageContext;
    recordId = '';

    @wire(getRecord, {
        recordId: '$recordId',
        fields: PRICEBOOK_FIELDS
      })
      pricebook2;
    
    pricebooksProduct = [];

    subscribeToMessageChannel() {
        this.subscription = subscribe(
          this.messageContext,
          recordSelected,
          (message) => this.handleMessage(message)
        );
    }

    handleMessage(message){
        this.recordId = message.recordId;
        getPricebooksProduct({recordId: this.recordId})
            .then(result =>{
                result.forEach(r=> {
                    let record =  Object.assign({}, r);
                    record.Name = r.Product2.Name;
                    this.pricebooksProduct.push(record);
                });
            })
            .catch(error => {
                this.error = error;
            });
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    navigateToRecordViewPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: "Pricebook2",
                actionName: "view"
            },
        });
    }

    get pricebookName(){
        return getFieldValue(this.pricebook2.data,PRICEBOOK_NAME_FIELD );
    }

    get column(){
        return cols;
    }
}