import { LightningElement, track, api } from 'lwc';
import NAME_FIELD from '@salesforce/schema/ProductReview__c.Name';
import COMMENT_FIELD from '@salesforce/schema/ProductReview__c.Comment__c';
import RATING_FIELD from '@salesforce/schema/ProductReview__c.Rating__c';
import ACCEPTED_FIELD from '@salesforce/schema/ProductReview__c.Accepted__c';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import MS_review_updated from '@salesforce/label/c.MS_review_updated';
import MS_updated_review_wait_for_accept from '@salesforce/label/c.MS_updated_review_wait_for_accept';
import MS_edit_review from '@salesforce/label/c.MS_edit_review';
import MS_close from '@salesforce/label/c.MS_close';
import MS_subject from '@salesforce/label/c.MS_subject';
import MS_rating from '@salesforce/label/c.MS_rating';
import MS_cancel from '@salesforce/label/c.MS_cancel';
import MS_save from '@salesforce/label/c.MS_save';


export default class EditProductReview extends NavigationMixin(LightningElement) {

    label = {
        MS_edit_review,
        MS_close,
        MS_subject,
        MS_rating,
        MS_cancel,
        MS_save
    };

    accepted = false;
    nameField = NAME_FIELD;
    commentField = COMMENT_FIELD;
    ratingField = RATING_FIELD;
    acceptedField = ACCEPTED_FIELD;
    haveChanges = true;
    @track isModalOpen = true;
    @api productReview;
    @api productId;
    @api rating;
    @track comment;
    @track subject;
    

    connectedCallback(){
        this.comment = this.productReview.Comment__c;
        this.subject = this.productReview.Name;
    }

    closeModal() {
        this.isModalOpen = false;
        this.closeQuickAction();
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeQuickAction() {
        const closeQA = new CustomEvent('close');
        this.dispatchEvent(closeQA);
    }

    handleSubmit(event){
        event.preventDefault();
        this.template.querySelector('lightning-record-edit-form').submit(this.fields);
    }

    handleRatingChanged(event) {
        this.rating = event.detail.rating;
        this.detectChanges();
    }

    handleCommentChange(event) {
        this.comment = event.target.value;
        this.detectChanges();
    }

    handleSubjectChange(event) {
        this.subject = event.target.value;
        this.detectChanges();
    }
 
    handleSuccess(event){
        this.closeModal();
        const refresh = new CustomEvent('refresh');
        this.dispatchEvent(refresh);
        const toastEvent = new ShowToastEvent ({
            title: MS_review_updated,
            message: MS_updated_review_wait_for_accept,
            variant: "success"
        });
        this.dispatchEvent(toastEvent);
        setTimeout(()=>{
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.productId,
                    objectApiName: 'Product2',
                    actionName: 'view'
                 },
            });
        },1000);
    }

    detectChanges(){
        if( this.productReview.Name != this.subject || this.productReview.Comment__c != this.comment || this.productReview.Rating__c != this.rating ){
            this.haveChanges = false;
        }else{
            this.haveChanges = true;
        }
    }

}