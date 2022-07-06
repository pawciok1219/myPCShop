import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import NAME_FIELD from '@salesforce/schema/Product2.Name';
import PRODUCTFAMILY_FIELD from '@salesforce/schema/Product2.Family';
import PRODUCER_FIELD from '@salesforce/schema/Product2.Producer__c';
import MODEL_FIELD from '@salesforce/schema/Product2.Model__c';
import DISPLAYURL_FIELD from '@salesforce/schema/Product2.DisplayUrl';
import deleteProductFromCache from '@salesforce/apex/MS_ShoppingCartController.deleteProductFromCache';
import MS_error from '@salesforce/label/c.MS_error';
import { publish, MessageContext } from 'lightning/messageService';
import NumberOfProductsInCache from '@salesforce/messageChannel/NumberOfProductsInCache__c';
import getNumberItemsInCache from '@salesforce/apex/MS_ShoppingCartController.getNumberItemsInCache';
import updateQuantity from '@salesforce/apex/MS_ShoppingCartController.updateQuantity';
import MS_product_successfully_cart from '@salesforce/label/c.MS_product_successfully_cart';
import MS_unit_price from '@salesforce/label/c.MS_unit_price';
import MS_total_amount from '@salesforce/label/c.MS_total_amount';


const fields = [NAME_FIELD,PRODUCTFAMILY_FIELD,MODEL_FIELD,PRODUCER_FIELD,DISPLAYURL_FIELD];

export default class ShoppingCartItem extends NavigationMixin(LightningElement) {

    label = {
        MS_unit_price,
        MS_total_amount
    };

    @api recordId;
    @api productCache;
    sfdcBaseURL;
    @track isLoading = false;

    @track isDialogVisible = false;
    @track originalMessage;
    @track displayMessage = '';
    
    renderedCallback() {
        let baseURL = '/s';
        this.sfdcBaseURL = baseURL.concat('/detail/',this.recordId);
    }

    @wire(getRecord, { recordId: '$recordId', fields })
    product;

    @wire(MessageContext)
    messageContext;

    setDecrementCounter(){
        if(this.productCache.quantity == 1){
            this.productCache.quantity = 1;
        } else{
            updateQuantity({productId: this.productCache.product, quantityItem: this.productCache.quantity-1}).then(() => {
                const decrement = new CustomEvent('decrement');
                this.dispatchEvent(decrement);
            })
        }
    }

    setIncrementCounter(){
        if(this.productCache.quantity == 10){
            this.productCache.quantity = 10;
        } else{
            updateQuantity({productId: this.productCache.product, quantityItem: this.productCache.quantity+1}).then(() => {
                const increment = new CustomEvent('increment');
                this.dispatchEvent(increment);
            })
        }
    }

    get name() {
        return getFieldValue(this.product.data, NAME_FIELD);
    }

    get productfamily() {
        return getFieldValue(this.product.data, PRODUCTFAMILY_FIELD);
    }

    get producer() {
        return getFieldValue(this.product.data, PRODUCER_FIELD);
    }

    get model() {
        return getFieldValue(this.product.data, MODEL_FIELD);
    }

    get displayurl() {
        return getFieldValue(this.product.data, DISPLAYURL_FIELD);
    }

    handleClick(event){
        if(event.target.name === 'openConfirmation'){
            this.originalMessage = 'test message';
            this.isDialogVisible = true;
        }else if(event.target.name === 'confirmModal'){
            if(event.detail !== 1){
                this.displayMessage = 'Status: ' + event.detail.status + '. Event detail: ' + JSON.stringify(event.detail.originalMessage) + '.';
                if(event.detail.status === 'confirm') {
                    this.isLoading = true;

                    deleteProductFromCache({ productId: this.recordId})
                    .then(() => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                message: MS_product_successfully_cart,
                                variant: 'success'
                            })
                        );
                    })
                    .catch(error => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: MS_error,
                                message: error.body.message,
                                variant: 'error'
                            })
                        );
                    }).finally(() => {
                        getNumberItemsInCache().then((result) => {
                            const payload = {number: result};
                            publish(this.messageContext, NumberOfProductsInCache, payload);
                            const deleteproduct = new CustomEvent('deleteproduct', {detail: result});
                            this.dispatchEvent(deleteproduct);
                        });
                    });
                }else if(event.detail.status === 'cancel'){
                    this.isDialogVisible = false;
                }
            }
            this.isDialogVisible = false;
        }
    }

}