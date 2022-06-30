import { LightningElement, api, track, wire} from 'lwc';
import PRODUCT_REVIEW_OBJECT from '@salesforce/schema/ProductReview__c';
import NAME_FIELD from '@salesforce/schema/ProductReview__c.Name';
import COMMENT_FIELD from '@salesforce/schema/ProductReview__c.Comment__c';
import checkUserHaveProductReview from '@salesforce/apex/MS_CustomProductPageController.checkUserHaveProductReview';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import {NavigationMixin} from 'lightning/navigation';
import MS_review_created from '@salesforce/label/c.MS_review_created';
import MS_review_subject from '@salesforce/label/c.MS_review_subject';
import MS_rating from '@salesforce/label/c.MS_rating';
import MS_error from '@salesforce/label/c.MS_error';
import MS_submit from '@salesforce/label/c.MS_submit';
import MS_your_review_wait_for_accept from '@salesforce/label/c.MS_your_review_wait_for_accept';
import MS_thank_for_review from '@salesforce/label/c.MS_thank_for_review';
import MS_review_waiting from '@salesforce/label/c.MS_review_waiting';
import uId from '@salesforce/user/Id';

export default class ProductAddReviewForm extends NavigationMixin(LightningElement) {

    label = {
        MS_review_subject,
        MS_rating,
        MS_submit,
        MS_thank_for_review,
        MS_review_waiting
    };

    userId = uId;
    productId;
    rating = 0;
    productReviewObject = PRODUCT_REVIEW_OBJECT;
    nameField = NAME_FIELD;
    commentField = COMMENT_FIELD;
    wiredActivities;
    @track isLoading = false;
    @track userHaveProductReview;
    @track isAccepted;

    @wire(checkUserHaveProductReview, {userID: '$userId', productId: '$productId'})
    wiredResulted(result){
        this.wiredActivities = result; 
        const {data, error} = result;
        if(data){
            if(data.length == 0){
                this.userHaveProductReview = false;
            } else{
                this.userHaveProductReview = true;
                this.isAccepted  = data[0].Accepted__c;
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
    
    @api
    get recordId() {
        return this.productId;
    }
    set recordId(value) {
        this.setAttribute('productId', value);        
        this.productId = value;
        
    }
    
    handleRatingChanged(event) {
        this.rating = event.detail.rating;
    }
    
    handleSubmit(event) {
        this.isLoading = true;
        event.preventDefault();
        const fields = event.detail.fields;
        fields.Rating__c = this.rating;
        fields.Product__c = this.productId;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
        setTimeout(()=>{
            this.isLoading = false;
        },1000);
        refreshApex(this.wiredActivities);
    }
    
    handleSuccess() {
        this.isLoading = true;
        const toast = new ShowToastEvent({
            title: MS_review_created,
            message: MS_your_review_wait_for_accept,
            variant: 'success',
        });
        this.dispatchEvent(toast);
        this.handleReset();
        refreshApex(this.wiredActivities);
        setTimeout(()=>{
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.recordId,
                    objectApiName: 'Product2',
                    actionName: 'view'
                 },
            });
        },1500);
    }
    
    handleReset() {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (inputFields) {
            inputFields.forEach(field => { field.reset(); });
        }
    }
}