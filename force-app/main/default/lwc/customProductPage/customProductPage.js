import { LightningElement, api, track, wire } from 'lwc';
import getProductImages from '@salesforce/apex/MS_CustomProductPageController.getProductImages';
import getProductOverallRating from '@salesforce/apex/MS_CustomProductPageController.getProductOverallRating';
import getProductPrice from '@salesforce/apex/MS_CustomProductPageController.getProductPrice';
import addProductToCacheShoppingCart from '@salesforce/apex/MS_ShoppingCartController.addProductToCacheShoppingCart';
import getNumberItemsInCache from '@salesforce/apex/MS_ShoppingCartController.getNumberItemsInCache';
import { publish, MessageContext } from 'lightning/messageService';
import NumberOfProductsInCache from '@salesforce/messageChannel/NumberOfProductsInCache__c';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from '@salesforce/schema/Product2.Name';
import PRODUCTCODE_FIELD from '@salesforce/schema/Product2.ProductCode';
import PRODUCTFAMILY_FIELD from '@salesforce/schema/Product2.Family';
import PRODUCER_FIELD from '@salesforce/schema/Product2.Producer__c';
import MODEL_FIELD from '@salesforce/schema/Product2.Model__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Product2.Description';
import AVAILABLE_FIELD from '@salesforce/schema/Product2.Available__c';
import MS_error from '@salesforce/label/c.MS_error';
import MS_reviews from '@salesforce/label/c.MS_reviews';
import MS_product_code from '@salesforce/label/c.MS_product_code';
import MS_producer from '@salesforce/label/c.MS_producer';
import MS_available from '@salesforce/label/c.MS_available';
import MS_category from '@salesforce/label/c.MS_category';
import MS_model_v2 from '@salesforce/label/c.MS_model_v2';
import MS_description from '@salesforce/label/c.MS_description';
import MS_per_item from '@salesforce/label/c.MS_per_item';
import MS_add_to_cart from '@salesforce/label/c.MS_add_to_cart';
import MS_add_to_cart_item from '@salesforce/label/c.MS_add_to_cart_item';

const fields = [NAME_FIELD,PRODUCTCODE_FIELD,PRODUCTFAMILY_FIELD,MODEL_FIELD,DESCRIPTION_FIELD,PRODUCER_FIELD,AVAILABLE_FIELD];

export default class CustomProductPage extends LightningElement {

    label = {
        MS_reviews,
        MS_product_code,
        MS_producer,
        MS_available,
        MS_category,
        MS_model_v2,
        MS_description,
        MS_per_item,
        MS_add_to_cart
    };

    @api recordId;

    @track overallRating;
    @track numberofReviews;

    @track recentlyProductsList = [];
    @track displayImage;
    @track isFirstPage = true;
    @track isLastPage = false;
    @track currentIndexImage = 0;
    @track price;
    @track quantityProduct = 1;

    @wire(MessageContext)
    messageContext;

    @wire(getProductImages, {recordId: '$recordId'})
    wiredResulted(result){
        const {data, error} = result;
        this.recentlyProductsList  = [];
        if(data){
            data.forEach(link => {
                this.recentlyProductsList.push('/sfc/servlet.shepherd/document/download/' + link.ContentDocumentId);
            })
            this.displayImage = this.recentlyProductsList[0];
            if(this.recentlyProductsList.length == 1){
                this.isLastPage = true;
            }
        }
        if(error){ 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error,
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }

    get options() {
        return [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
        ];
    }

    @wire(getRecord, { recordId: '$recordId', fields })
    product;

    @wire(getProductOverallRating, {recordId: '$recordId'})
    wiredOverallProductRating(result){
        const {data, error} = result;
        this.overallRating = 0;
        this.numberofReviews = 0;
        if(data){
          this.overallRating  = data[0].overallAverage;
          this.numberofReviews = data[0].numberOfReviews;
        }
        if(error){ 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error,
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }

    @wire(getProductPrice, {recordId: '$recordId'})
    wiredPrice(result){
        const {data, error} = result;
        if(data){
            this.price = data[0].UnitPrice;
        }
        if(error){ 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error,
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }

    get name() {
        return getFieldValue(this.product.data, NAME_FIELD);
    }

    get productcode() {
        return getFieldValue(this.product.data, PRODUCTCODE_FIELD);
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

    get description() {
        return getFieldValue(this.product.data, DESCRIPTION_FIELD);
    }

    get available(){
        return getFieldValue(this.product.data, AVAILABLE_FIELD);
    }

    changeDisplayPhoto(event) {
        this.displayImage = event.target.dataset.value;
    }

    handleChangeQuantity(event) {
        this.quantityProduct = event.detail.value;
    }

    addProductToCache(){
        addProductToCacheShoppingCart({productId: this.recordId, quantityItem: this.quantityProduct})
        .then(()=> {
            getNumberItemsInCache().then((result) => {
                const payload = {number: result};
                publish(this.messageContext, NumberOfProductsInCache, payload);
            });
            this.dispatchEvent(
                new ShowToastEvent({
                    message: this.name + ' ' + MS_add_to_cart_item,
                    variant: 'success'
                })
            );
        })
    }

}