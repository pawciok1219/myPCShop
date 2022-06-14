import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getLatestProducts from '@salesforce/apex/MS_ProductCustomerPortal.getLatestProducts';
import getNumberOfRecords from '@salesforce/apex/MS_ProductCustomerPortal.getNumberOfRecords';
import MS_error from '@salesforce/label/c.MS_error';

export default class LatestProducts extends LightningElement {

    @track productList = [];
    @track offset = 0;
    @track isFirstPage = true;
    @track isLastPage = false;
    @track numberOfNewProducts = 0;
    @track isLoading = false;

    @wire(getLatestProducts, {offsetNumber: '$offset'})
    wiredResulted(result){
        const {data, error} = result;
        this.productList = [];
        if(data){
            data.forEach(r=> {
                let record = Object.assign({}, r);
                record.DisplayUrl = r.Product2.DisplayUrl;
                record.Family = r.Product2.Family;
                record.Id = r.Product2.Id;
                record.Name = r.Product2.Name;
                this.productList.push(record);
            });
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

    @wire(getNumberOfRecords)
    wiredNumberOfNewProducts(result){
        const {data, error} = result;
        if(data){
            data.forEach(r=> {
                this.numberOfNewProducts = r.totalRecords;
            });
            if((this.offset + 3) >= this.numberOfNewProducts){
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

    handleNextChangeOffset(){
        this.isLoading = true;
        if(this.offset == 0){
            this.isFirstPage = false;
        }
        if((this.offset + 1) + 3 >= this.numberOfNewProducts){
            this.isLastPage = true;
            this.isFirstPage = false;
        }else{
            this.isLastPage = false;
        }
        this.offset = this.offset + 1;
        setTimeout(()=>{
            this.isLoading = false;
        },200);
    }

    handlePreviousChangeOffset(){
        this.isLoading = true;
        if((this.offset - 1) == 0 ){
            this.isFirstPage = true;
        }
        this.isLastPage = false;

        this.offset = this.offset - 1;
        setTimeout(()=>{
            this.isLoading = false;
        },200);
    }

}