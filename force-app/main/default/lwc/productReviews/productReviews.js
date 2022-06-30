import { api, LightningElement, track } from 'lwc';
import getAllReviews from '@salesforce/apex/MS_CustomProductPageController.getAllReviews';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import uId from '@salesforce/user/Id';
import MS_no_reviews_available from '@salesforce/label/c.MS_no_reviews_available';
import MS_error from '@salesforce/label/c.MS_error';
import MS_reviews_pag from '@salesforce/label/c.MS_reviews_pag';
import MS_review_successfully_deleted from '@salesforce/label/c.MS_review_successfully_deleted';

const PAGE_SIZE = 3;

export default class ProductReviews extends NavigationMixin(LightningElement) {

    label = {
        MS_no_reviews_available,
        MS_reviews_pag
    };

    userId = uId;
    page = 1;
    productId;
    total;
    error;
    productReviews;
    productAllReviews;
    isLoading;
    @track startReview = 0;
    @track pages;
    @track displayEditForm = false;
    @track productReview;
    
    get recordId() {
        return this.productId;
    }
    @api
    set recordId(value) {
        this.setAttribute('productId', value);        
        this.productId = value;      
        this.getReviews();
    }
    
    get reviewsToShow() {
        return this.productReviews !== undefined && this.productReviews != null && this.productReviews.length > 0;
    }
    
    @api
    refresh() {
        this.getReviews();
    }

    openEditForm(event){
        const review = event.target.value;
        this.productReview = review;
        this.displayEditForm = true;
    }
    
    getReviews() {
        if (this.productId) {
            this.isLoading = true;
            getAllReviews({productId: this.productId}).then((result) => {
                this.productAllReviews = [];
                result.forEach(r=> {
                        let record = Object.assign({}, r);
                        if(r.CreatedById == this.userId){
                            record.toRemove = true;
                        }else {
                            record.toRemove = false;
                        }
                        this.productAllReviews.push(record);
                });
                this.total = this.productAllReviews.length;
                if((this.startReview + PAGE_SIZE) > this.total-1){
                    this.productReviews = this.productAllReviews.slice(this.startReview,this.total);
                }else{
                    this.productReviews = this.productAllReviews.slice(this.startReview,this.startReview + PAGE_SIZE);
                }
                let pagesNumber = this.productAllReviews.length / PAGE_SIZE;
                this.pages = Math.ceil(pagesNumber);
                this.error = undefined;
            }).catch((error) => {
                this.error = error;
            }).finally(() => {
                this.isLoading = false;
            });
        } else {
            return;
        }
    }

    deleteReview(event){
        this.isLoading = true;
        const Id = event.target.dataset.id;
        deleteRecord(Id)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_review_successfully_deleted,
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
            this.getReviews();
            this.isLoading = false;
            setTimeout(()=>{
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: this.recordId,
                        objectApiName: 'Product2',
                        actionName: 'view'
                     },
                });
            },3000);
        });
    }

    navigateToRecord(event) { 
        event.preventDefault();
        event.stopPropagation();
        let recordId = event.target.dataset.recordId;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: "User",
                actionName: "view"
            },
        });
    }

    handlePagePrevious() {
        this.page = this.page - 1;
        this.startReview = this.page * PAGE_SIZE - 3;
        this.getReviews();
    }

    handlePageNext() {
        this.page = this.page + 1;
        this.startReview = this.page * PAGE_SIZE - 3;
        this.getReviews();
    }

    handleCloseModal(){
        this.displayEditForm = false;
    }
}  