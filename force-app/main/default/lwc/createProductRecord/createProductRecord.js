import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import getStandardPricebookId from '@salesforce/apex/filePreviewAndDownloadController.getStandardPricebookId';
import MS_close from '@salesforce/label/c.MS_close';
import MS_product_created from '@salesforce/label/c.MS_product_created';
import MS_product_created_id from '@salesforce/label/c.MS_product_created_id';
import MS_error_adding_price from '@salesforce/label/c.MS_error_adding_price';
import MS_new_product from '@salesforce/label/c.MS_new_product';
import MS_price from '@salesforce/label/c.MS_price';
import MS_price_underflow from '@salesforce/label/c.MS_price_underflow';
import MS_cancel from '@salesforce/label/c.MS_cancel';
import MS_save_and_next from '@salesforce/label/c.MS_save_and_next';


export default class CreateProductRecord extends LightningElement {

    label = {
        MS_close,
        MS_new_product,
        MS_price,
        MS_price_underflow,
        MS_cancel,
        MS_save_and_next
    };

    @track productPrice;
    @track isModalImageOpen = false;
    @track isModalOpen = true;
    @track Id;

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handlePriceChange(event){
        this.productPrice = event.target.value;
    }

    handleSubmit(event){
        event.preventDefault();
        this.template.querySelector('lightning-record-edit-form').submit(this.fields);
        this.closeModal();
    }

    handleSuccess(event){
        const recordId = event.detail.id;
        const toastEvent = new ShowToastEvent ({
            title: MS_product_created,
            message: MS_product_created_id+" "+ recordId,
            variant: "success"
        });
        this.dispatchEvent(toastEvent);
        this.Id = recordId;

        getStandardPricebookId()
        .then(result => {
            let fields = {'Pricebook2Id' : result, 'Product2Id' : recordId, 'UnitPrice' : this.productPrice};
            let objRecordInput = {'apiName' : 'PricebookEntry', fields};
            createRecord(objRecordInput).then(response => {
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: MS_error_adding_price,
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
        })
        this.isModalImageOpen = true;
    }

}